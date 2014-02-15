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
  var conditions = {$where : 'this.orderData && Array.isArray(this.orderData.operations)'};

  prodShiftOrders.find(conditions, {'orderData.operations': 1}).each(function(err, doc)
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

    ++queue;

    var operations = {};

    doc.orderData.operations.forEach(function(operation)
    {
      operations[operation.no] = operation;
    });

    prodShiftOrders.update(
      {_id: doc._id},
      {$set: {'orderData.operations': operations}},
      function done(err)
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
      }
    );
  });
});
