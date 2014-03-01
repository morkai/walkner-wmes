'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var collection = db.collection('pressworksheets');
  var queue = 0;
  var allDone = false;

  collection.find(null, {orders: 1}).each(function(err, doc)
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

    queue++;

    var orders = doc.orders.map(function(order)
    {
      order.downtimes = order.downtimes.map(function(downtime)
      {
        return {
          prodDowntime: null,
          reason: downtime._id,
          label: downtime.label,
          duration: downtime.count
        };
      });

      order.losses = order.losses.map(function(loss)
      {
        return {
          reason: loss._id,
          label: loss.label,
          count: loss.count
        };
      });

      return order;
    });

    var update = {
      $set: {orders: orders}
    };

    collection.update({_id: doc._id}, update, function(err)
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
