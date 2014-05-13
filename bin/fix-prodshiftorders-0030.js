/*globals emit:true*/

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
  var prodlogentries = db.collection('prodlogentries');

  step(
    function()
    {
      function map()
      {
        /*jshint validthis:true*/

        if (!this.orderData || !this.orderData.operations)
        {
          return;
        }

        var ops = Object.keys(this.orderData.operations);

        for (var i = 0, l = ops.length; i < l; ++i)
        {
          var op = this.orderData.operations[ops[i]];

          if ((op.workCenter === '' && op.laborTime === -1) || op.no === '0030')
          {
            return emit(this._id, {orderId: this.orderId, operationNo: this.operationNo});
          }
        }
      }

      function reduce(key, values)
      {
        return values[0];
      }

      console.log('prodShiftOrders.mapReduce...');

      prodshiftorders.mapReduce(map, reduce, {out: {inline: 1}}, this.next());
    },
    function(err, docs)
    {
      if (err)
      {
        return this.skip(err);
      }

      var orderIds = {};
      var prodShiftOrders = [];

      console.log('prodShiftOrders.forEach %d...', docs.length);

      docs.forEach(function(doc)
      {
        orderIds[doc.value.orderId] = true;
        prodShiftOrders.push({
          _id: doc._id,
          orderId: doc.value.orderId,
          operationNo: doc.value.operationNo
        });
      });

      this.prodShiftOrders = prodShiftOrders;

      console.log('orders.find...');

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

      var orderToOperations = {};

      console.log('orders.forEach %d...', orders.length);

      orders.forEach(function(order)
      {
        var operations = {};

        order.operations.forEach(function(operation)
        {
          if ((operation.workCenter !== '' && operation.laborTime !== -1)
            || !operations[operation.no])
          {
            operations[operation.no] = operation;
          }
        });

        orderToOperations[order._id] = operations;
      });

      this.orderToOperations = orderToOperations;
    },
    function()
    {
      console.log('updating...');

      for (var i = 0, l = this.prodShiftOrders.length; i < l; ++i)
      {
        var prodShiftOrder = this.prodShiftOrders[i];
        var operations = this.orderToOperations[prodShiftOrder.orderId];

        if (!operations)
        {
          continue;
        }

        var operation = operations[prodShiftOrder.operationNo];

        if (!operation)
        {
          continue;
        }

        prodshiftorders.update(
          {_id: prodShiftOrder._id},
          {$set: {
            laborTime: operation.laborTime,
            machineTime: operation.machineTime,
            'orderData.operations': operations
          }},
          this.parallel()
        );
        prodlogentries.update(
          {type: 'changeOrder', prodShiftOrder: prodShiftOrder._id},
          {$set: {
            'data.laborTime': operation.laborTime,
            'data.machineTime': operation.machineTime,
            'data.orderData.operations': operations
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
