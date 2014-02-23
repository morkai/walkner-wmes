'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var prodShiftOrders = db.collection('prodshiftorders');
  var queue = 0;
  var allDone = false;
  var fields = {
    startedAt: 1,
    finishedAt: 1,
    operationNo: 1,
    'orderData.operations': 1
  };

  prodShiftOrders.find(null, fields).each(function(err, doc)
  {
    if (err)
    {
      return console.error(err.stack);
    }

    if (!doc)
    {
      allDone = true;

      return;
    }

    queue += 1;

    var laborTime = 0;
    var operation = doc.orderData && doc.orderData.operations
      ? doc.orderData.operations[doc.operationNo] : null;

    if (operation && typeof operation.laborTime === 'number' && operation.laborTime !== -1)
    {
      laborTime = operation.laborTime;
    }

    var duration = 0;

    if (doc.finishedAt)
    {
      duration = (doc.finishedAt - doc.startedAt) / 3600000;
    }

    var update = {
      $set: {
        laborTime: laborTime,
        duration: Math.round(duration * 10000) / 10000
      }
    };

    prodShiftOrders.update({_id: doc._id}, update, function done(err)
    {
      --queue;

      if (queue === 0 && allDone)
      {
        return console.log('ALL DONE!');
      }

      if (err)
      {
        return console.error(err.stack);
      }
    });
  });
});
