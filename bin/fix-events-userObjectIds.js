'use strict';

var mongodb = require('mongodb');
var step = require('h5.step');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var events = db.collection('events');

  events.find({'user._id': {$type: 7}}).toArray(function(err, docs)
  {
    if (err)
    {
      db.close();

      return console.error(err.stack);
    }

    step(
      function()
      {
        for (var i = 0, l = docs.length; i < l; ++i)
        {
          var event = docs[i];

          events.update(
            {_id: event._id}, {$set: {'user._id': String(event.user._id)}}, this.parallel()
          );
        }
      },
      function(err)
      {
        if (err)
        {
          console.error(err.stack);
        }
        else
        {
          console.log('ALL DONE!');
        }

        db.close();
      }
    );
  });
});
