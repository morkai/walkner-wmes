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

  step(
    function()
    {
      db.collection('users').find({}, {lastName: 1, firstName: 1}).toArray(this.next());
    },
    function(err, docs)
    {
      if (err)
      {
        return this.skip(err);
      }

      var userIdToName = {};

      docs.forEach(function(user)
      {
        userIdToName[user._id] = user.lastName + ' ' + user.firstName;
      });

      this.userIdToName = userIdToName;

      setImmediate(this.next());
    },
    function()
    {
      events.find({user: {$ne: null}}, {user: 1}).toArray(this.next());
    },
    function(err, docs)
    {
      if (err)
      {
        return this.skip(err);
      }

      for (var i = 0, l = docs.length; i < l; ++i)
      {
        var event = docs[i];
        var userId = String(event.user._id);
        var update = {
          $set: {
            'user._id': userId,
            'user.name': this.userIdToName[userId] || event.user.login
          }
        };

        events.update({_id: event._id}, update, this.parallel());
      }
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
