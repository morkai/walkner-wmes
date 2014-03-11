'use strict';

var MongoClient = require('mongodb').MongoClient;
var step = require('h5.step');
var config = require('../config/mongodb');

MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var prodLogEntries = db.collection('prodlogentries');
  var prodShiftOrders = db.collection('prodshiftorders');
  var prodDowntimes = db.collection('proddowntimes');
  var orders = db.collection('orders');

  step(
    function fixProdDowntimesStep()
    {
      prodDowntimes.update(
        {orderId: /^115/, mechOrder: true},
        {$set: {mechOrder: false}},
        {multi: true},
        this.parallel()
      );
      prodLogEntries.update(
        {type: 'startDowntime', 'data.mechOrder': true, 'data.orderId': /^115/},
        {$set: {'data.mechOrder': false}},
        {multi: true},
        this.parallel()
      );
    },
    function handleFixedProdDowntimesStep(err, count)
    {
      if (err)
      {
        return this.skip(err);
      }

      console.log("Fixed %d ProdDowntimes", count);
    },
    function findBuggedProdLogEntriesStep()
    {
      var conditions = {
        type: {$in: ['changeOrder', 'correctOrder']},
        'data.orderId': /^115/,
        'data.mechOrder': true
      };

      prodLogEntries.find(conditions, null, {createdAt: 1}).toArray(this.next());
    },
    function fixProdLogEntriesStep(err, docs)
    {
      if (err)
      {
        return this.skip(err);
      }

      console.log("Found %d ProdLogEntries", docs.length);

      for (var i = 0, l = docs.length; i < l; ++i)
      {
        fixProdLogEntry(docs[i], this.parallel());
      }
    },
    function finalize(err)
    {
      if (err)
      {
        console.error(err.stack);
      }
      else
      {
        console.log("DONE!");
      }

      db.close();
    }
  );

  function fixProdLogEntry(prodLogEntry, done)
  {
    var fields = {changes: 0, importTs: 0, __v: 0};

    orders.findOne({_id: prodLogEntry.data.orderId}, fields, function(err, order)
    {
      if (err)
      {
        return done(err);
      }

      order.no = order._id;

      delete order._id;

      var operations = {};

      order.operations.forEach(function(operation)
      {
        operations[operation.no] = operation;
      });

      order.operations = operations;

      prodLogEntry.data.mechOrder = false;
      prodLogEntry.data.orderData = order;

      step(
        function()
        {
          prodLogEntries.update(
            {_id: prodLogEntry._id},
            {$set: {data: prodLogEntry.data}},
            this.parallel()
          );

          prodShiftOrders.update(
            {_id: prodLogEntry.prodShiftOrder},
            {$set: {mechOrder: false, orderData: order}},
            this.parallel()
          );

          var update = {
            mechOrder: false,
            orderId: order.no,
            operationNo: prodLogEntry.data.operationNo
          };

          prodLogEntries.update(
            {
              type: 'startDowntime',
              prodShiftOrder: prodLogEntry.prodShiftOrder,
              createdAt: {$gt: prodLogEntry.createdAt}
            },
            {$set: update},
            {multi: true},
            this.parallel()
          );

          prodDowntimes.update(
            {prodShiftOrder: prodLogEntry.prodShiftOrder},
            {$set: update},
            {multi: true},
            this.parallel()
          );
        },
        done
      );
    });
  }
});
