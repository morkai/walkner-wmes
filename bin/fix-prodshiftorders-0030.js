'use strict';

var mongodb = require('mongodb');
var step = require('h5.step');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var prodshiftorders = db.collection('prodshiftorders');

  step(
    function()
    {
      prodshiftorders.find(
        {"orderData.operations.0030.workCenter": ""},
        {orderId: 1, "orderData.operations.0030": 1}
      ).toArray(this.next());
    },
    function(err, docs)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.prodShiftOrders = docs;

      var orderIds = {};

      docs.forEach(function(doc)
      {
        orderIds[doc.orderId] = true;
      });

      db.collection('orders')
        .find({_id: {$in: Object.keys(orderIds)}}, {operations: 1})
        .toArray(this.next());
    },
    function(err, orders)
    {
      if (err)
      {
        return this.skip(err);
      }

      var orderToOperation = {};

      orders.forEach(function(order)
      {
        var operations = order.operations.filter(function(operation)
        {
          return operation.no === '0030'
            && operation.workCenter !== ''
            && operation.laborTime !== '-1';
        });

        if (operations.length)
        {
          orderToOperation[order._id] = operations[0];
        }
      });

      this.orderToOperation = orderToOperation;
    },
    function()
    {
      for (var i = 0, l = this.prodShiftOrders.length; i < l; ++i)
      {
        var prodShiftOrder = this.prodShiftOrders[i];
        var operation = this.orderToOperation[prodShiftOrder.orderId];

        if (!operation)
        {
          continue;
        }

        prodshiftorders.update(
          {_id: prodShiftOrder._id},
          {$set: {
            laborTime: operation.laborTime,
            machineTime: operation.machineTime,
            "orderData.operations.0030": operation
          }},
          this.parallel()
        );
      }
    },
    function(err)
    {
      db.close();

      if (err)
      {
        return console.error(err.stack);
      }

      console.log('ALL DONE!');
    }
  );
});
