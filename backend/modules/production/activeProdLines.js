// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpActiveProdLines(app, productionModule)
{
  var fteModule = app[productionModule.config.fteId];
  var orgUnitsModule = app[productionModule.config.orgUnitsId];
  var mongoose = app[productionModule.config.mongooseId];

  var shiftToProdLines = {};
  var shiftToProdFlows = {};

  productionModule.getActiveProdLinesInProdFlow = function(prodFlowId, shiftDate, done)
  {
    if (!shiftDate)
    {
      shiftDate = fteModule.getCurrentShift().date;
    }

    var shiftKey = getShiftKey(shiftDate);

    if (shiftToProdFlows[shiftKey] && shiftToProdFlows[shiftKey][prodFlowId])
    {
      return done(null, Object.keys(shiftToProdFlows[shiftKey][prodFlowId]));
    }

    aggregateActiveProdLines(prodFlowId, shiftDate, done);
  };

  app.broker.subscribe('production.synced.*', function(changes)
  {
    if (changes.types.indexOf('changeOrder') !== -1)
    {
      activateProdLine(changes.prodLine);
    }
  });

  app.broker.subscribe('shiftChanged', function()
  {
    shiftToProdLines = {};
    shiftToProdFlows = {};
  });

  app.broker.subscribe('app.started')
    .setLimit(1)
    .on('message', function()
    {
      aggregateActiveProdLines(null, fteModule.getCurrentShift().date);
    });

  function aggregateActiveProdLines(prodFlowId, shiftDate, done)
  {
    var conditions = {
      startedAt: {
        $gte: shiftDate,
        $lt: new Date(shiftDate.getTime() + 8 * 3600 * 1000)
      }
    };

    if (prodFlowId)
    {
      conditions.prodFlow = typeof prodFlowId === 'string'
        ? new mongoose.Types.ObjectId(prodFlowId)
        : prodFlowId;
    }

    mongoose.model('ProdShiftOrder').aggregate(
      {$match: conditions},
      {$group: {_id: '$prodFlow', prodLines: {$addToSet: '$prodLine'}}},
      function(err, results)
      {
        if (err)
        {
          productionModule.error("Failed to aggregate active prod lines: %s", err.stack);

          if (done)
          {
            done(err);
          }

          return;
        }

        var prodLineIds = [];
        var shiftKey = getShiftKey(shiftDate);

        shiftToProdLines[shiftKey] = {};
        shiftToProdFlows[shiftKey] = {};

        results.forEach(function(result)
        {
          var prodFlowId = result._id.toString();

          shiftToProdFlows[shiftKey][prodFlowId] = {};

          result.prodLines.forEach(function(prodLineId)
          {
            prodLineIds.push(prodLineId);

            shiftToProdLines[shiftKey][prodLineId] = true;
            shiftToProdFlows[shiftKey][prodFlowId][prodLineId] = true;
          });
        });

        if (done)
        {
          done(null, prodLineIds);
        }
      }
    );
  }

  function activateProdLine(prodLineId, prodFlowId)
  {
    if (!prodFlowId)
    {
      prodFlowId = getProdFlowIdByProdLineId(prodLineId);
    }

    if (!prodFlowId)
    {
      return;
    }

    var currentShift = fteModule.getCurrentShift();
    var currentShiftKey = getShiftKey(currentShift.date);

    if (!shiftToProdLines[currentShiftKey])
    {
      shiftToProdLines[currentShiftKey] = {};
      shiftToProdFlows[currentShiftKey] = {};
    }

    if (shiftToProdLines[currentShiftKey][prodLineId])
    {
      return;
    }

    shiftToProdLines[currentShiftKey][prodLineId] = true;

    if (!shiftToProdFlows[currentShiftKey][prodFlowId])
    {
      shiftToProdFlows[currentShiftKey][prodFlowId] = {};
    }

    shiftToProdFlows[currentShiftKey][prodFlowId][prodLineId] = true;

    var activeProdLinesInProdFlow = Object.keys(shiftToProdFlows[currentShiftKey][prodFlowId]);
    var allActiveProdLines = Object.keys(shiftToProdLines[currentShiftKey]);

    productionModule.debug(
      "Prod line [%s] of prod flow [%s] activated (prod flow=%d; total=%d)",
      prodLineId,
      prodFlowId,
      activeProdLinesInProdFlow.length,
      allActiveProdLines.length
    );

    app.broker.publish('production.prodLineActivated', {
      shiftId: currentShift,
      prodLine: prodLineId,
      prodFlow: prodFlowId,
      activeProdLinesInProdFlow: Object.keys(shiftToProdFlows[currentShiftKey][prodFlowId]),
      allActiveProdLines: Object.keys(shiftToProdLines[currentShiftKey])
    });
  }

  function getShiftKey(shiftDate)
  {
    if (!shiftDate)
    {
      shiftDate = fteModule.getCurrentShift().date;
    }

    return shiftDate.getTime().toString();
  }

  function getProdFlowIdByProdLineId(prodLineId)
  {
    var prodFlows = orgUnitsModule.getProdFlowsFor('prodLine', prodLineId);

    if (prodFlows && prodFlows.length)
    {
      return prodFlows[0]._id.toString();
    }

    return null;
  }
};
