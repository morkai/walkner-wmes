'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var collection = db.collection(process.argv[2]);
  var queue = 0;
  var allDone = false;

  collection.find(null, {date: 1, shift: 1}).each(function(err, doc)
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

    if (doc.shift === 1)
    {
      doc.date.setHours(6);
    }
    else if (doc.shift === 2)
    {
      doc.date.setHours(14);
    }
    else
    {
      doc.date.setHours(22);
    }

    collection.update({_id: doc._id}, {$set: {date: doc.date}}, function(err)
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
