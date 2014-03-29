'use strict';

var step = require('h5.step');
var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var collection = db.collection('pressworksheets');

  step(
    function()
    {
      collection
        .find({'orders.orderData._id': {$exists: true}}, {nc12: 1, orders: 1})
        .toArray(this.next());
    },
    function(err, pressWorksheets)
    {
      if (err)
      {
        return this.skip(err);
      }

      var step = this;

      pressWorksheets.forEach(function(pressWorksheet)
      {
        var orders = pressWorksheet.orders.map(function(order)
        {
          order.orderData.nc12 = order.orderData._id;

          delete order.orderData._id;

          return order;
        });

        collection.update(
          {_id: pressWorksheet._id},
          {$set: {orders: orders}},
          step.parallel()
        );
      });
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
