'use strict';

var MongoClient = require('mongodb').MongoClient;
var step = require('h5.step');
var config = require('../config/mongodb');

MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var prodLogEntries = db.collection('prodlogentries');

  step(
    function findProdLogEntries()
    {
      prodLogEntries
        .find({type: 'changeShift', 'data.startedProdShift.creator': null}, {creator: 1})
        .toArray(this.next());
    },
    function fixProdLogEntriesStep(err, docs)
    {
      if (err)
      {
        return this.skip(err);
      }

      for (var i = 0, l = docs.length; i < l; ++i)
      {
        prodLogEntries.update(
          {_id: docs[i]._id},
          {$set: {'data.startedProdShift.creator': docs[i].creator}},
          this.parallel()
        );
      }
    },
    function finalize(err)
    {
      if (err)
      {
        console.error(err.stack);
      }
      else
      {
        console.log("ALL DONE!");
      }

      db.close();
    }
  );
});
