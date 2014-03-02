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

  collection.find(null, {orders: 1}).toArray(function(err, docs)
  {
    if (err)
    {
      return console.error(err.stack);
    }

    queue = docs.length;

    docs.forEach(function(doc)
    {
      var orders = doc.orders.map(function(order, i)
      {
        order.downtimes = order.downtimes.map(function(downtime)
        {
          return {
            prodDowntime: null,
            reason: String(downtime._id),
            label: String(downtime.label),
            duration: Number(downtime.count)
          };
        });

        order.losses = order.losses.map(function(loss)
        {
          return {
            reason: String(loss._id),
            label: String(loss.label),
            count: Number(loss.count)
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

        if (queue === 0)
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
});
