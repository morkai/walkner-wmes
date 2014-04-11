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

  var fteMasterEntries = db.collection('ftemasterentries');
  var fteLeaderEntries = db.collection('fteleaderentries');

  step(
    function()
    {
      fteMasterEntries.find({creator: {$type: 7}}).toArray(this.parallel());
      fteLeaderEntries.find({creator: {$type: 7}}).toArray(this.parallel());
    },
    function(err, masterDocs, leaderDocs)
    {
      for (var i = 0, l = masterDocs.length; i < l; ++i)
      {
        fixFteEntry(fteMasterEntries, masterDocs[i], this.parallel());
      }

      for (var j = 0, k = leaderDocs.length; j < k; ++j)
      {
        fixFteEntry(fteLeaderEntries, leaderDocs[j], this.parallel());
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

  function fixFteEntry(collection, fteEntry, done)
  {
    var creator = {
      id: fteEntry.creator,
      label: fteEntry.creatorLabel
    };
    var updater = !fteEntry.updater ? null : {
      id: fteEntry.updater,
      label: fteEntry.updaterLabel
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

    collection.update({_id: fteEntry._id}, update, done);
  }
});
