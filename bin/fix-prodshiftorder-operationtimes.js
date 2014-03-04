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
    var machineTime = 0;
    var operation = doc.orderData && doc.orderData.operations
      ? doc.orderData.operations[doc.operationNo] : null;

    if (operation && typeof operation.laborTime === 'number' && operation.laborTime !== -1)
    {
      laborTime = operation.laborTime;
    }

    if (operation && typeof operation.machineTime === 'number' && operation.machineTime !== -1)
    {
      machineTime = operation.machineTime;
    }

    var update = {
      $set: {
        laborTime: laborTime,
        machineTime: machineTime
      }
    };

    prodShiftOrders.update({_id: doc._id}, update, function done(err)
    {
      --queue;

      if (queue === 0 && allDone)
      {
        db.close();

        return console.log('ALL DONE!');
      }

      if (err)
      {
        return console.error(err.stack);
      }
    });
  });
});
