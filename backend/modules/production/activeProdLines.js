// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');

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

  app.broker.subscribe('production.synced.**', function(changes)
  {
    if (changes.types.indexOf('changeOrder') === -1)
    {
      return;
    }

    var prodShiftOrder = changes.prodShiftOrder;

    if (!prodShiftOrder)
    {
      return;
    }

    activateProdLine(prodShiftOrder.date, prodShiftOrder.prodLine, prodShiftOrder.prodFlow, false);
  });

  app.broker.subscribe('shiftChanged', function()
  {
    productionModule.debug("Removing active prod line data...");

    var currentShift = fteModule.getCurrentShift();
    var currentShiftKey = getShiftKey(currentShift.date);
    var earlyProdLines = Object.keys(shiftToProdLines[currentShiftKey] || {});

    shiftToProdLines = {};
    shiftToProdFlows = {};

    _.forEach(earlyProdLines, function(prodLineId)
    {
      activateProdLine(currentShift.date, prodLineId, null, true);
    });
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

        if (shiftToProdLines[shiftKey] === undefined)
        {
          shiftToProdLines[shiftKey] = {};
        }

        if (shiftToProdFlows[shiftKey] === undefined)
        {
          shiftToProdFlows[shiftKey] = {};
        }

        _.forEach(results, function(result)
        {
          var prodFlowId = result._id.toString();

          shiftToProdFlows[shiftKey][prodFlowId] = {};

          _.forEach(result.prodLines, function(prodLineId)
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

  function activateProdLine(shiftDate, prodLineId, prodFlowId, reactivation)
  {
    if (!shiftDate)
    {
      return productionModule.debug("Tried to activate prod line [%s] on an unknown shift.", prodLineId);
    }

    var currentShift = fteModule.getCurrentShift();
    var shiftsDiff = shiftDate.getTime() - currentShift.date.getTime();

    if (shiftsDiff < 0)
    {
      return productionModule.info("Tried to activate prod line [%s] on shift [%s].", prodLineId, shiftDate);
    }

    if (!prodFlowId)
    {
      prodFlowId = getProdFlowIdByProdLineId(prodLineId);
    }

    if (!prodFlowId)
    {
      return;
    }

    var shiftKey = getShiftKey(shiftDate);

    if (!shiftToProdLines[shiftKey])
    {
      shiftToProdLines[shiftKey] = {};
      shiftToProdFlows[shiftKey] = {};
    }

    if (shiftToProdLines[shiftKey][prodLineId])
    {
      return;
    }

    shiftToProdLines[shiftKey][prodLineId] = true;

    if (!shiftToProdFlows[shiftKey][prodFlowId])
    {
      shiftToProdFlows[shiftKey][prodFlowId] = {};
    }

    shiftToProdFlows[shiftKey][prodFlowId][prodLineId] = true;

    var allActiveProdLines = Object.keys(shiftToProdLines[shiftKey]);
    var activeProdLinesInProdFlow = Object.keys(shiftToProdFlows[shiftKey][prodFlowId]);

    productionModule.debug(
      "%s prod line [%s]; in prod flow (%d of all %d): %s (shift [%s])",
      reactivation ? 'Reactivated early' : 'Activated',
      prodLineId,
      activeProdLinesInProdFlow.length,
      allActiveProdLines.length,
      activeProdLinesInProdFlow.join(', '),
      shiftDate
    );

    app.broker.publish('production.prodLineActivated', {
      shiftId: {
        date: shiftDate,
        no: shiftDate.getHours() === 6 ? 1 : shiftDate.getHours() === 14 ? 2 : 3
      },
      prodLine: prodLineId,
      prodFlow: prodFlowId,
      activeProdLinesInProdFlow: activeProdLinesInProdFlow,
      allActiveProdLines: allActiveProdLines
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
