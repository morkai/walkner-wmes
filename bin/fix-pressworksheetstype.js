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

  collection.find({type: null}, {paintShop: 1}).each(function(err, doc)
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

    var update = {
      $set: {type: doc.paintShop ? 'paintShop' : 'mech'},
      $unset: {paintShop: 1}
    };

    collection.update({_id: doc._id}, update, function(err)
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
