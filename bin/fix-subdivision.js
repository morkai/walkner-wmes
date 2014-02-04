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

  collection.find({subdivision: {$type: 2}}, {subdivision: 1}).each(function(err, doc)
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

    collection.update({_id: doc._id}, {$set: {subdivision: str2oid(doc.subdivision)}}, function(err)
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

function str2oid(str)
{
  return new mongodb.ObjectID(str);
}
