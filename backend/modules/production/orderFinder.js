'use strict';

exports.findOrdersByNo = function(Order, no, done)
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
  if (nc12.length === 12 || /[a-zA-Z]/.test(nc12))
  {
    return findOrderByNc12(Order, MechOrder, nc12, done);
  }

  return findOrdersStartingWithNc12(Order, MechOrder, nc12, done);
};


function findOrderByNc12(Order, MechOrder, nc12, done)
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
      return done(err);
    }

    if (orders.length === 1)
    {
      return done(null, orders.map(function(order)
      {
        order._id = nc12;

        return order;
      }));
    }

    findMechOrderByNc12(MechOrder, nc12, done);
  });
}

function findMechOrderByNc12(MechOrder, nc12, done)
{
  MechOrder.findById(nc12, {name: 1, operations: 1}).lean().exec(function(err, mechOrder)
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
    query: {nc12: new RegExp('^' + nc12)},
    out: {inline: 1},
    sort: {nc12: 1},
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
      return done(err);
    }

    if (results.length)
    {
      return done(null, results.map(function(result)
      {
        var order = result.value;

        order._id = result._id;

        delete order.createdAt;

        return order;
      }));
    }

    return findMechOrdersStartingWithNc12(MechOrder, nc12, done);
  });
}

function findMechOrdersStartingWithNc12(MechOrder, nc12, done)
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
      return done(err);
    }

    return done(mechOrders);
  });
}
