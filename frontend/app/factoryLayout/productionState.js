// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../pubsub',
  '../core/Model',
  './ProdLineState',
  './ProdLineStateCollection',
  './FactoryLayout'
], function(
  pubsub,
  Model,
  ProdLineState,
  ProdLineStateCollection,
  FactoryLayout)
{
  'use strict';

  var UNLOAD_DELAY = 60000;

  var stateChangedMessageQueue = [];
  var stateChangedSub = null;
  var loading = false;
  var loaded = false;
  var unloadTimer = null;
  var productionState = new Model();

  window.productionState = productionState;

  productionState.url = '/production/state';
  productionState.factoryLayout = new FactoryLayout();
  productionState.prodLineStates = new ProdLineStateCollection();

  productionState.parse = function(data)
  {
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

    if (stateChangedSub === null)
    {
      stateChangedSub = pubsub.subscribe('production.stateChanged.**', handleStateChangedMessage);
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
      if (stateChangedSub !== null)
      {
        stateChangedSub.cancel();
        stateChangedSub = null;
      }

      productionState.prodLineStates.reset([]);

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
