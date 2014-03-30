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
        .toArray(this.parallel());

      prodLogEntries
        .find({type: 'startDowntime', 'data.creator': null}, {creator: 1})
        .toArray(this.parallel());
    },
    function fixProdLogEntriesStep(err, changeShiftDocs, startDowntimeDocs)
    {
      if (err)
      {
        return this.skip(err);
      }

      var i;
      var l;

      for (i = 0, l = changeShiftDocs.length; i < l; ++i)
      {
        prodLogEntries.update(
          {_id: changeShiftDocs[i]._id},
          {$set: {'data.startedProdShift.creator': changeShiftDocs[i].creator}},
          this.parallel()
        );
      }

      for (i = 0, l = startDowntimeDocs.length; i < l; ++i)
      {
        prodLogEntries.update(
          {_id: startDowntimeDocs[i]._id},
          {$set: {'data.creator': startDowntimeDocs[i].creator}},
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
