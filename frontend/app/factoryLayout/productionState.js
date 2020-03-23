// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../pubsub',
  '../core/Model',
  'app/production/ProductionSettingCollection',
  'app/planning/WhOrderStatusCollection',
  './FactoryLayoutSettingCollection',
  './ProdLineState',
  './ProdLineStateCollection',
  './FactoryLayout'
], function(
  broker,
  pubsub,
  Model,
  ProductionSettingCollection,
  WhOrderStatusCollection,
  FactoryLayoutSettingCollection,
  ProdLineState,
  ProdLineStateCollection,
  FactoryLayout
) {
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
  productionState.nlsDomain = 'factoryLayout';
  productionState.settings = {
    factoryLayout: new FactoryLayoutSettingCollection(),
    production: new ProductionSettingCollection()
  };
  productionState.factoryLayout = new FactoryLayout();
  productionState.prodLineStates = new ProdLineStateCollection(null, {
    settings: productionState.settings
  });
  productionState.historyData = new ProdLineStateCollection(null, {
    settings: productionState.settings
  });
  productionState.whOrderStatuses = new WhOrderStatusCollection();

  productionState.isLoading = function() { return loading; };

  productionState.parse = function(data)
  {
    if (data.settings)
    {
      this.settings.factoryLayout.reset(data.settings.filter(function(d) { return /^factoryLayout/.test(d._id); }));
      this.settings.production.reset(data.settings.filter(function(d) { return /^production/.test(d._id); }));
    }

    if (Array.isArray(data.prodLineStates))
    {
      this.prodLineStates.reset(this.prodLineStates.parse(data));
    }

    if (data.factoryLayout)
    {
      this.factoryLayout.set(data.factoryLayout);
    }

    if (Array.isArray(data.whOrderStatuses))
    {
      this.whOrderStatuses.reset(this.whOrderStatuses.parse({collection: data.whOrderStatuses}));
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
      productionState.pubsub.subscribe('shiftChanged', handleShiftChangedMessage);
      productionState.settings.factoryLayout.setUpPubsub(productionState.pubsub);
      productionState.settings.production.setUpPubsub(productionState.pubsub);
      productionState.whOrderStatuses.setUpPubsub(productionState.pubsub);
    }

    productionState.whOrderStatuses.setCurrentDate();

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
      productionState.settings.factoryLayout.reset([]);
      productionState.settings.production.reset([]);
      productionState.whOrderStatuses.reset([]);

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
      if (loaded)
      {
        productionState.load(true);
      }
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

  function handleShiftChangedMessage()
  {
    if (!loaded)
    {
      return;
    }

    setTimeout(reloadWhOrderStatuses, 10000);
  }

  function reloadWhOrderStatuses()
  {
    if (!loaded)
    {
      return;
    }

    productionState.whOrderStatuses.setCurrentDate();
    productionState.whOrderStatuses.fetch({reset: true});
  }

  return productionState;
});
