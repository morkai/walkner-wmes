'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var queue = 2;

  var pressWorksheets = db.collection('pressworksheets');

  pressWorksheets.find({'orders.downtimes._id': 'tI'}, {orders: 1}).toArray(function(err, docs)
  {
    if (err)
    {
      return console.error(err.stack);
    }

    db.collection('prodlogentries').update(
      {type: 'startDowntime', 'data.reason': 'tI'},
      {$set: {'data.reason': 'A'}},
      {multi: true},
      done
    );

    db.collection('proddowntimes').update(
      {reason: 'tI'},
      {$set: {reason: 'A'}},
      {multi: true},
      done
    );

    if (!docs.length)
    {
      ++queue;

      return done();
    }

    docs.forEach(function(doc)
    {
      ++queue;

      var orders = doc.orders.map(function(order)
      {
        order.downtimes = order.downtimes.map(function(downtime)
        {
          if (downtime._id === 'tI')
          {
            downtime._id = 'A';
          }

          return downtime;
        });

        return order;
      });

      pressWorksheets.update({_id: doc._id}, {$set: {orders: orders}}, done);
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
      return console.error(err.stack);
    }
  }
});

function str2oid(str)
{
  return new mongodb.ObjectID(str);
}
