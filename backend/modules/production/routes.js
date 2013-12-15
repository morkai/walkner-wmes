/*jshint maxparams:5*/
/*globals emit:true*/

'use strict';

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

  function findOrdersByNo(no, res, next)
  {
    var query;

    if (no.length === 9)
    {
      query = Order.findById(no, {changes: 0, importTs: 0});
    }
    else
    {
      query = Order
        .find({_id: new RegExp('^' + no)}, {changes: 0, importTs: 0, __v: 0})
        .sort({_id: 1})
        .limit(10);
    }

    query.lean().exec(function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      if (!result)
      {
        result = [];
      }
      else if (!Array.isArray(result))
      {
        result = [result];
      }

      return res.send(result);
    });
  }

  function findOrdersByNc12(nc12, res, next)
  {
    if (nc12.length === 12 || /[a-zA-Z]/.test(nc12))
    {
      return findOrderByNc12(nc12, res, next);
    }

    return findOrdersStartingWithNc12(nc12, res, next);
  }

  function findOrderByNc12(nc12, res, next)
  {
    var query = Order
      .find({nc12: nc12}, {name: 1, operations: 1})
      .sort({createdAt: -1})
      .limit(1)
      .lean();

    query.exec(function(err, orders)
    {
      if (err)
      {
        return next(err);
      }

      if (orders.length === 1)
      {
        return res.send(orders.map(function(order)
        {
          order._id = order.nc12;

          delete order.nc12;

          return order;
        }));
      }

      findMechOrderByNc12(nc12, res, next);
    });
  }

  function findMechOrderByNc12(nc12, res, next)
  {
    MechOrder.findById(nc12, {name: 1, operations: 1}).lean().exec(function(err, mechOrder)
    {
      if (err)
      {
        return next(err);
      }

      res.send(mechOrder ? [mechOrder] : []);
    });
  }

  function findOrdersStartingWithNc12(nc12, res, next)
  {
    var options = {
      query: {nc12: new RegExp('^' + nc12)},
      out: {inline: 1},
      sort: {nc12: 1},
      limit: 10,
      map: function()
      {
        if (this.operations && this.operations.length)
        {
          emit(this.nc12, {
            name: this.name,
            operations: this.operations,
            createdAt: this.createdAt
          });
        }
      },
      reduce: function(key, orders)
      {
        var latestOrder = null;

        orders.forEach(function(order)
        {
          if (latestOrder === null || order.createdAt > latestOrder.createdAt)
          {
            latestOrder = order;
          }
        });

        return latestOrder;
      }
    };

    Order.mapReduce(options, function(err, results)
    {
      if (err)
      {
        return next(err);
      }

      if (results.length)
      {
        return res.send(results.map(function(result)
        {
          var order = result.value;

          order._id = result._id;

          delete order.createdAt;

          return order;
        }));
      }

      return findMechOrdersStartingWithNc12(nc12, res, next);
    });
  }

  function findMechOrdersStartingWithNc12(nc12, res, next)
  {
    var query = MechOrder
      .find({_id: new RegExp('^' + nc12)}, {name: 1, operations: 1})
      .sort({_id: 1})
      .limit(10)
      .lean();

    query.exec(function(err, mechOrders)
    {
      if (err)
      {
        return next(err);
      }

      return res.send(mechOrders);
    });
  }
};
