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

  orgUnitsModule.getAllByType('prodLine').forEach(function(prodLine)
  {
    prodLineStateMap[prodLine._id] = new ProdLineState(app, productionModule, prodLine);
  });

  scheduleHourChange();

  // TODO: FIX ORDER NOT BEING MARKED AS FINISHED IF A NEW ONE IS STARTED IMMEDIATELY
  app.broker.subscribe('production.synced.**', function(changes)
  {
    var prodLineState = prodLineStateMap[changes.prodLine];

    if (!prodLineState)
    {
      return productionModule.debug("Data synced but no state for prod line [%s]...", changes.prodLine);
    }

    prodLineState.update(changes);
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(data)
  {
    var prodLineState = prodLineStateMap[data.prodLine];

    if (prodLineState && prodLineState.getCurrentShiftId() === data.prodShift)
    {
      prodLineState.onQuantitiesPlanned();
    }
  });

  app.broker.subscribe('app.started').setLimit(1).on('message', function()
  {
    loaded = true;

    app.broker.publish('production.stateLoaded');
  });

  function scheduleHourChange()
  {
    var nextHourTime = moment().minutes(0).seconds(0).milliseconds(999).add('hours', 1).valueOf();
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
