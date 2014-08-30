// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

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

  express.get('/production/state', function(req, res, next)
  {
    productionModule.getAllProdLineState(function(err, allProdLineState)
    {
      if (err)
      {
        return next(err);
      }

      return res.json({
        allProdLineState: allProdLineState
      });
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
