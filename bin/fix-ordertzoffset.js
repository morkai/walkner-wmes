'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var collection = db.collection('orders');
  var queue = 0;
  var allDone = false;

  collection.find(null, {startDate: 1}).each(function(err, doc)
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

    if (!doc.startDate)
    {
      return;
    }

    queue++;

    var tzOffsetMs = doc.startDate.getTimezoneOffset() * 60 * 1000 * -1;

    collection.update({_id: doc._id}, {$set: {tzOffsetMs: tzOffsetMs}}, function(err)
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
