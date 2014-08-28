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

  var allProdLineState = {};

  productionModule.getAllProdLineState = function()
  {
    return lodash.values(allProdLineState);
  };

  productionModule.updateProdLineState = function(newStateData)
  {
    var prodLineState = allProdLineState[newStateData._id];

    if (prodLineState)
    {
      prodLineState.update(newStateData);
    }
  };

  orgUnitsModule.getAllByType('prodLine').forEach(function(prodLine)
  {
    allProdLineState[prodLine._id] = new ProdLineState(app.broker.sandbox(), prodLine);
  });

  app.broker.subscribe('production.synced.**', function(changes)
  {
    var prodLineState = allProdLineState[changes.prodLine];

    if (!prodLineState)
    {
      return productionModule.debug("Data synced but no state for prod line [%s]...", changes.prodLine);
    }

    var newStateData = {};

    if (changes.prodShift)
    {
      if (changes.prodShift._id)
      {
        newStateData.prodShiftId = changes.prodShift._id;
      }

      if (changes.prodShift.quantitiesDone)
      {
        newStateData.quantitiesDone = changes.prodShift.quantitiesDone;
      }
    }

    if (changes.prodShiftOrder !== undefined)
    {
      newStateData.prodShiftOrderId = changes.prodShiftOrder === null
        ? null
        : changes.prodShiftOrder._id;
    }

    if (changes.prodDowntime !== undefined)
    {
      newStateData.prodDowntimeId = changes.prodDowntime ? (changes.prodDowntime._id || null) : null;
    }

    prodLineState.update(newStateData);
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(data)
  {
    var prodLineState = allProdLineState[data.prodLine];

    if (prodLineState && prodLineState.prodShiftId === data.prodShift)
    {
      prodLineState.update({quantitiesDone: data.quantitiesDone});
    }
  });

  function scheduleMetricsUpdate()
  {
    var nextHourTime = moment().minutes(0).seconds(0).milliseconds(999).add('hours', 1).valueOf();
    var delay = nextHourTime - Date.now();

    setTimeout(updateMetrics, delay);
  }

  function updateMetrics()
  {
    lodash.each(allProdLineState, function(prodLineState)
    {
      prodLineState.updateMetrics();
    });

    setImmediate(scheduleMetricsUpdate);
  }
};
