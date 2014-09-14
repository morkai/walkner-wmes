// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../broker',
  '../pubsub',
  '../core/Model',
  './FactoryLayoutSettingCollection',
  './ProdLineState',
  './ProdLineStateCollection',
  './FactoryLayout'
], function(
  broker,
  pubsub,
  Model,
  FactoryLayoutSettingCollection,
  ProdLineState,
  ProdLineStateCollection,
  FactoryLayout)
{
  'use strict';

  var UNLOAD_DELAY = 60000;

  var stateChangedMessageQueue = [];
  var loading = false;
  var loaded = false;
  var unloadTimer = null;
  var productionState = new Model();

  window.productionState = productionState;

  productionState.pubsub = null;
  productionState.url = '/production/state';
  productionState.settings = new FactoryLayoutSettingCollection();
  productionState.factoryLayout = new FactoryLayout();
  productionState.prodLineStates = new ProdLineStateCollection();
  productionState.historyData = new ProdLineStateCollection();

  productionState.parse = function(data)
  {
    if (data.settings)
    {
      this.settings.reset(data.settings);
    }

    if (Array.isArray(data.prodLineStates))
    {
      this.prodLineStates.reset(data.prodLineStates.map(ProdLineState.parse));
    }

    if (data.factoryLayout)
    {
      this.factoryLayout.set(data.factoryLayout);
    }

    return {};
  };

  productionState.load = function(force)
  {
    if (unloadTimer !== null)
    {
      clearTimeout(unloadTimer);
      unloadTimer = null;
    }

    if (loaded && !force)
    {
      return;
    }

    if (productionState.pubsub === null)
    {
      productionState.pubsub = pubsub.sandbox();
      productionState.pubsub.subscribe('production.stateChanged.**', handleStateChangedMessage);
      productionState.settings.setUpPubsub(productionState.pubsub);
    }

    return productionState.fetch();
  };

  productionState.unload = function()
  {
    if (!loaded)
    {
      return;
    }

    if (unloadTimer !== null)
    {
      clearTimeout(unloadTimer);
    }

    unloadTimer = setTimeout(function()
    {
      if (productionState.pubsub !== null)
      {
        productionState.pubsub.destroy();
        productionState.pubsub = null;
      }

      productionState.prodLineStates.reset([]);
      productionState.settings.reset([]);

      unloadTimer = null;
      loaded = false;
    }, UNLOAD_DELAY);
  };

  productionState.on('request', function()
  {
    loading = true;
  });

  productionState.on('sync', function()
  {
    loading = false;
    loaded = true;

    stateChangedMessageQueue.forEach(handleStateChangedMessage);
    stateChangedMessageQueue = [];
  });

  productionState.on('error', function()
  {
    loading = false;
    loaded = false;
    stateChangedMessageQueue = [];

    productionState.prodLineStates.reset([]);
  });

  [
    'divisions',
    'subdivisions',
    'mrpControllers',
    'prodFlows',
    'workCenters',
    'prodLines'
  ].forEach(function(orgUnitsType)
  {
    broker.subscribe(orgUnitsType + '.synced', function()
    {
      productionState.load(true);
    });
  });

  function handleStateChangedMessage(message)
  {
    if (loading)
    {
      return stateChangedMessageQueue.push(message);
    }

    var prodLineState = productionState.prodLineStates.get(message._id);

    if (prodLineState && message.v > prodLineState.get('v'))
    {
      prodLineState.update(message);
    }
  }

  return productionState;
});
