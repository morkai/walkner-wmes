// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');

var MECH_ORDER_FIELDS = {
  name: 1,
  mrp: 1,
  operations: 1,
  materialNorm: 1
};

exports.findOrdersByNo = function(Order, no, done)
{
  var query;

  if (typeof no !== 'string')
  {
    return done(new Error('INVALID_INPUT'));
  }

  if (no.length === 9)
  {
    query = Order.findById(no, {changes: 0, importTs: 0, __v: 0});
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
      return done(err);
    }

    if (!result)
    {
      result = [];
    }
    else if (!Array.isArray(result))
    {
      result = [result];
    }

    return done(null, result);
  });
};

exports.findOrdersByNc12 = function(Order, MechOrder, nc12, done)
{
  if (typeof nc12 !== 'string')
  {
    return done(new Error('INVALID_INPUT'));
  }

  if (nc12.length === 12 || /[a-zA-Z]/.test(nc12))
  {
    return findOrderByNc12(Order, MechOrder, nc12, done);
  }

  return findOrdersStartingWithNc12(Order, MechOrder, nc12, done);
};

function findOrderByNc12(Order, MechOrder, nc12, done)
{
  var query = Order
    .find({nc12: nc12, finishDate: {$gte: getTwoWeeksAgo()}}, MECH_ORDER_FIELDS)
    .sort({finishDate: -1})
    .limit(1)
    .lean();

  query.exec(function(err, orders)
  {
    if (err)
    {
      return done(err);
    }

    if (Array.isArray(orders)
      && orders[0]
      && Array.isArray(orders[0].operations)
      && orders[0].operations.length)
    {
      return setMechOrderData(MechOrder, orders.map(function(order)
      {
        order._id = nc12;

        return order;
      }), done);
    }

    findMechOrderByNc12(MechOrder, nc12, done);
  });
}

function findMechOrderByNc12(MechOrder, nc12, done)
{
  MechOrder.findById(nc12, MECH_ORDER_FIELDS).lean().exec(function(err, mechOrder)
  {
    if (err)
    {
      return done(err);
    }

    done(null, mechOrder ? [mechOrder] : []);
  });
}

function findOrdersStartingWithNc12(Order, MechOrder, nc12, done)
{
  /*globals emit:true*/

  var options = {
    query: {nc12: new RegExp('^' + nc12), finishDate: {$gte: getTwoWeeksAgo()}},
    out: {inline: 1},
    map: function()
    {
      if (this.operations && this.operations.length)
      {
        emit(this.nc12, {
          name: this.name,
          mrp: this.mrp,
          operations: this.operations,
          finishDate: this.finishDate
        });
      }
    },
    reduce: function(key, orders)
    {
      var latestOrder = null;

      orders.forEach(function(order)
      {
        if (latestOrder === null || order.finishDate > latestOrder.finishDate)
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
      return done(err);
    }

    if (results.length)
    {
      return setMechOrderData(MechOrder, results.map(function(result)
      {
        var order = result.value;

        order._id = result._id;

        delete order.finishDate;

        return order;
      }), done);
    }

    return findMechOrdersStartingWithNc12(MechOrder, nc12, done);
  });
}

function findMechOrdersStartingWithNc12(MechOrder, nc12, done)
{
  var query = MechOrder
    .find({_id: new RegExp('^' + nc12)}, MECH_ORDER_FIELDS)
    .sort({_id: 1})
    .limit(10)
    .lean();

  query.exec(function(err, mechOrders)
  {
    if (err)
    {
      return done(err);
    }

    return done(null, mechOrders);
  });
}

function setMechOrderData(MechOrder, orders, done)
{
  var orderMap = {};

  orders.forEach(function(order)
  {
    orderMap[order._id] = order;
  });

  var query = MechOrder.find({_id: {$in: Object.keys(orderMap)}}, {mrp: 1, materialNorm: 1}).lean();

  query.exec(function(err, mechOrders)
  {
    if (err)
    {
      return done(err);
    }

    mechOrders.forEach(function(mechOrder)
    {
      var order = orderMap[mechOrder._id];

      if (order)
      {
        order.mrp = mechOrder.mrp;
      }

      order.materialNorm = mechOrder.materialNorm;
    });

    return done(null, orders);
  });
}

function getTwoWeeksAgo()
{
  return moment().subtract(2, 'weeks').hours(0).minutes(0).seconds(0).milliseconds(0).toDate();
}
