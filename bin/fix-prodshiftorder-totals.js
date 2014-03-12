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

  prodShiftOrders.find({}, {quantityDone: 1, losses: 1}).toArray(function(err, docs)
  {
    if (err)
    {
      db.close();

      return console.error(err.stack);
    }

    queue = docs.length;

    docs.forEach(function(doc)
    {
      var quantityLost = !Array.isArray(doc.losses)
        ? 0
        : doc.losses.reduce(function(sum, loss) { return sum + loss.count; }, 0);
      var totalQuantity = doc.quantityDone + quantityLost;

      prodShiftOrders.update(
        {_id: doc._id},
        {$set: {totalQuantity: totalQuantity, quantityLost: quantityLost}},
        done
      );
    });
  });

  function done(err)
  {
    --queue;

    if (queue === 0)
    {
      db.close();

      return console.log('ALL DONE!');
    }

    if (err)
    {
      db.close();

      return console.error(err.stack);
    }
  }
});
