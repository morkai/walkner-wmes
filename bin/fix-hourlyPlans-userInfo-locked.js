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

  var hourlyPlans = db.collection('hourlyplans');

  hourlyPlans.find({creator: {$type: 7}}).toArray(function(err, docs)
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
          fixHourlyPlan(docs[i], this.parallel());
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

  function fixHourlyPlan(hourlyPlan, done)
  {
    var creator = {
      id: hourlyPlan.creator,
      label: hourlyPlan.creatorLabel
    };
    var updater = !hourlyPlan.updater ? null : {
      id: hourlyPlan.updater,
      label: hourlyPlan.updaterLabel
    };
    var update = {
      $set: {
        creator: creator,
        updater: updater
      },
      $unset: {
        creatorLabel: 1,
        updaterLabel: 1,
        locked: 1
      }
    };

    hourlyPlans.update({_id: hourlyPlan._id}, update, done);
  }
});
