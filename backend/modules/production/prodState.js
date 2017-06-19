// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const ProdLineState = require('./ProdLineState');

module.exports = function setUpProdState(app, productionModule)
{
  const orgUnitsModule = app[productionModule.config.orgUnitsId];

  const CRUD_OPERATION_TYPES = {
    addOrder: true,
    editOrder: true,
    deleteOrder: true,
    addDowntime: true,
    editDowntime: true,
    deleteDowntime: true
  };

  let loaded = false;
  const prodLineStateMap = {};
  let extendedDowntimeDelay = 15;

  productionModule.getExtendedDowntimeDelay = function() { return extendedDowntimeDelay; };

  productionModule.getProdLineStates = function(done)
  {
    if (loaded)
    {
      return done(null, _.values(prodLineStateMap));
    }

    app.broker.subscribe('production.stateLoaded').setLimit(1).on('message', function()
    {
      productionModule.getProdLineStates(done);
    });
  };

  productionModule.getProdLineState = function(prodLineId)
  {
    return prodLineStateMap[prodLineId] || null;
  };

  _.forEach(orgUnitsModule.getAllByType('prodLine'), function(prodLine)
  {
    if (!prodLine.deactivatedAt)
    {
      createProdLineState(prodLine, false);
    }
  });

  scheduleHourChange();

  app.broker.subscribe('prodLines.added', function(message)
  {
    const prodLineId = message.model._id;
    const prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

    if (prodLine)
    {
      createProdLineState(prodLine, true);

      return;
    }

    const startTime = Date.now();
    const sub = app.broker.subscribe('prodLines.synced', function()
    {
      const prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

      if (prodLine)
      {
        createProdLineState(prodLine, true);
      }

      if (prodLine || (Date.now() - startTime) > 10000)
      {
        sub.cancel();
      }
    });
  });

  app.broker.subscribe('prodLines.deleted', function(message)
  {
    const prodLineId = message.model._id;
    let prodLineState = prodLineStateMap[prodLineId];

    if (prodLineState)
    {
      delete prodLineStateMap[prodLineId];

      prodLineState.destroy();
      prodLineState = null;
    }
  });

  app.broker.subscribe('production.synced.**', function(changes)
  {
    const multiChange = changes.types.length > 1;

    if (!multiChange && changes.types[0] === 'corroborateDowntime' && !changes.prodShift)
    {
      return;
    }

    const prodLineState = prodLineStateMap[changes.prodLine];

    if (!prodLineState)
    {
      return productionModule.debug('Data synced but no state for prod line [%s]...', changes.prodLine);
    }

    const operationTypes = {
      crud: false,
      finishOrder: false,
      changeOrder: false,
      finishDowntime: false,
      startDowntime: false
    };

    _.forEach(changes.types, function(type)
    {
      if (CRUD_OPERATION_TYPES[type])
      {
        operationTypes.crud = true;
      }
      else
      {
        operationTypes[type] = true;
      }
    });

    const reloadOrders = operationTypes.crud
      || (multiChange && operationTypes.finishOrder && operationTypes.changeOrder);
    const reloadDowntimes = operationTypes.crud
      || (multiChange && operationTypes.finishDowntime && operationTypes.startDowntime);

    prodLineState.update(changes, {reloadOrders, reloadDowntimes});
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(data)
  {
    const prodLineState = prodLineStateMap[data.prodLine];

    if (prodLineState && prodLineState.getCurrentShiftId() === data.prodShift)
    {
      prodLineState.onQuantitiesPlanned();
    }
  });

  app.broker.subscribe('settings.updated.factoryLayout.extendedDowntimeDelay', function(message)
  {
    extendedDowntimeDelay = message.value;

    _.forEach(prodLineStateMap, function(prodLineState)
    {
      prodLineState.checkExtendedDowntime();
    });
  });

  app.broker.subscribe('app.started').setLimit(1).on('message', function()
  {
    app[productionModule.config.mongooseId]
      .model('Setting')
      .findById('factoryLayout.extendedDowntimeDelay')
      .lean()
      .exec(function(err, setting)
      {
        if (!err && setting && setting.value > 0 && setting.value < 1440)
        {
          extendedDowntimeDelay = setting.value;
        }

        loaded = true;

        app.broker.publish('production.stateLoaded');
      });
  });

  function createProdLineState(prodLine, notify)
  {
    const prodLineState = new ProdLineState(app, productionModule, prodLine);

    prodLineStateMap[prodLine._id] = prodLineState;

    if (notify)
    {
      app.broker.publish('production.stateCreated', prodLineState.toJSON());
    }
  }

  function scheduleHourChange()
  {
    const nextHourTime = moment().minutes(0).seconds(0).milliseconds(999).add(1, 'hours').valueOf();
    const delay = nextHourTime - Date.now();

    setTimeout(onHourChanged, delay);
  }

  function onHourChanged()
  {
    if (!loaded)
    {
      return app.broker.subscribe('production.stateLoaded', onHourChanged).setLimit(1);
    }

    const currentHour = new Date().getHours();

    _.forEach(prodLineStateMap, function(prodLineState)
    {
      prodLineState.onHourChanged(currentHour);
    });

    setImmediate(scheduleHourChange);
  }
};
