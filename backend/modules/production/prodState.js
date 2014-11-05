// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var moment = require('moment');
var ProdLineState = require('./ProdLineState');

module.exports = function setUpProdState(app, productionModule)
{
  var orgUnitsModule = app[productionModule.config.orgUnitsId];

  var loaded = false;
  var prodLineStateMap = {};
  var extendedDowntimeDelay = 15;

  productionModule.getExtendedDowntimeDelay = function() { return extendedDowntimeDelay; };

  productionModule.getProdLineStates = function(done)
  {
    if (loaded)
    {
      return done(null, lodash.values(prodLineStateMap));
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

  orgUnitsModule.getAllByType('prodLine').forEach(function(prodLine) { createProdLineState(prodLine, false); });

  scheduleHourChange();

  app.broker.subscribe('prodLines.added', function(message)
  {
    var prodLineId = message.model._id;
    var prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

    if (prodLine)
    {
      createProdLineState(prodLine, true);
    }
    else
    {
      var startTime = Date.now();
      var sub = app.broker.subscribe('prodLines.synced', function()
      {
        var prodLine = orgUnitsModule.getByTypeAndId('prodLine', prodLineId);

        if (prodLine)
        {
          createProdLineState(prodLine, true);
        }

        if (prodLine || (Date.now() - startTime) > 10000)
        {
          sub.cancel();
        }
      });
    }
  });

  app.broker.subscribe('prodLines.deleted', function(message)
  {
    var prodLineId = message.model._id;
    var prodLineState = prodLineStateMap[prodLineId];

    if (prodLineState)
    {
      delete prodLineStateMap[prodLineId];

      prodLineState.destroy();
      prodLineState = null;
    }
  });

  app.broker.subscribe('production.synced.**', function(changes)
  {
    var prodLineState = prodLineStateMap[changes.prodLine];

    if (!prodLineState)
    {
      return productionModule.debug("Data synced but no state for prod line [%s]...", changes.prodLine);
    }

    var multiChange = changes.types.length > 1;

    prodLineState.update(changes, {
      reloadOrders: multiChange
        && lodash.contains(changes.types, 'finishOrder')
        && lodash.contains(changes.types, 'changeOrder'),
      reloadDowntimes: multiChange
        && lodash.contains(changes.types, 'finishDowntime')
        && lodash.contains(changes.types, 'startDowntime')
    });
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(data)
  {
    var prodLineState = prodLineStateMap[data.prodLine];

    if (prodLineState && prodLineState.getCurrentShiftId() === data.prodShift)
    {
      prodLineState.onQuantitiesPlanned();
    }
  });

  app.broker.subscribe('settings.updated.factoryLayout.extendedDowntimeDelay', function(message)
  {
    extendedDowntimeDelay = message.value;

    lodash.forEach(prodLineStateMap, function(prodLineState)
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
        if (setting && setting.value > 0 && setting.value < 1440)
        {
          extendedDowntimeDelay = setting.value;
        }

        loaded = true;

        app.broker.publish('production.stateLoaded');
      });
  });

  function createProdLineState(prodLine, notify)
  {
    var prodLineState = new ProdLineState(app, productionModule, prodLine);

    prodLineStateMap[prodLine._id] = prodLineState;

    if (notify)
    {
      app.broker.publish('production.stateCreated', prodLineState.toJSON());
    }
  }

  function scheduleHourChange()
  {
    var nextHourTime = moment().minutes(0).seconds(0).milliseconds(999).add(1, 'hours').valueOf();
    var delay = nextHourTime - Date.now();

    setTimeout(onHourChanged, delay);
  }

  function onHourChanged()
  {
    if (!loaded)
    {
      return app.broker.subscribe('production.stateLoaded', onHourChanged).setLimit(1);
    }

    var currentHour = new Date().getHours();

    lodash.each(prodLineStateMap, function(prodLineState)
    {
      prodLineState.onHourChanged(currentHour);
    });

    setImmediate(scheduleHourChange);
  }
};
