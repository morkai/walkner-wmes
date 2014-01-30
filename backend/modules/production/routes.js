'use strict';

var step = require('h5.step');
var orderFinder = require('./orderFinder');

module.exports = function setUpProductionRoutes(app, productionModule)
{
  var express = app[productionModule.config.expressId];
  var mongoose = app[productionModule.config.mongooseId];
  var Order = mongoose.model('Order');
  var MechOrder = mongoose.model('MechOrder');

  express.get('/production/orders', function(req, res, next)
  {
    if (typeof req.query.no === 'string' && /^[0-9]{3,9}$/.test(req.query.no))
    {
      return findOrdersByNo(req.query.no, res, next);
    }

    if (typeof req.query.nc12 === 'string' && /^[a-zA-Z0-9]{3,12}$/.test(req.query.nc12))
    {
      return findOrdersByNc12(req.query.nc12, res, next);
    }

    return res.send(400);
  });

  express.get('/production/fillOrgUnits', function(req, res, next)
  {
    var ProdLogEntry = mongoose.model('ProdLogEntry');

    ProdLogEntry.distinct('prodLine', {division: null}, function(err, prodLineIds)
    {
      if (err)
      {
        return next(err);
      }

      var steps = [];
      var totalCount = 0;

      prodLineIds.forEach(function(prodLineId)
      {
        var prodLine = app.prodLines.modelsById[prodLineId];

        if (!prodLine)
        {
          return;
        }

        steps.push(function fixOrgUnitsStep()
        {
          var next = this.next();

          var workCenter = app.workCenters.modelsById[prodLine.workCenter];

          if (!workCenter)
          {
            return next();
          }

          var prodFlow = app.prodFlows.modelsById[workCenter.prodFlow];

          if (!prodFlow || !Array.isArray(prodFlow.mrpController) || !prodFlow.mrpController.length)
          {
            return next();
          }

          var mrpController = app.mrpControllers.modelsById[prodFlow.mrpController[0]];

          if (!mrpController)
          {
            return next();
          }

          var subdivision = app.subdivisions.modelsById[mrpController.subdivision];

          if (!subdivision)
          {
            return next();
          }

          var conditions = {
            prodLine: prodLineId,
            division: null
          };
          var update = {
            $set: {
              workCenter: prodLine.workCenter,
              prodFlow: workCenter.prodFlow,
              mrpControllers: prodFlow.mrpController,
              subdivision: mrpController.subdivision,
              division: subdivision.division
            }
          };
          var options = {multi: true};

          ProdLogEntry.update(conditions, update, options, function(err, count)
          {
            totalCount += count;

            next();
          });
        });
      });

      steps.push(function sendResult()
      {
        res.send(String(totalCount));
      });

      step(steps);
    });
  });

  function findOrdersByNo(no, res, next)
  {
    orderFinder.findOrdersByNo(Order, no, function(err, orders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(orders);
    });
  }

  function findOrdersByNc12(nc12, res, next)
  {
    orderFinder.findOrdersByNc12(Order, MechOrder, nc12, function(err, mechOrders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(mechOrders);
    });
  }
};
