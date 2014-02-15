'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var prodLogEntries = db.collection('prodlogentries');
  var prodShiftOrders = db.collection('prodshiftorders');
  var queue = 0;
  var allDone = false;
  var conditions = {
    type: 'changeOrder',
    'data.prodShiftOrder': {$exists: 1}
  };

  prodLogEntries.find(conditions, {prodShift: 1, prodShiftOrder: 1}).each(function(err, doc)
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

    queue += 2;

    prodLogEntries.update({_id: doc._id}, {$unset: {'data.prodShiftOrder': 1}}, done);
    prodShiftOrders.update({_id: doc.prodShiftOrder}, {$set: {prodShift: doc.prodShift}}, done);
  });

  function done(err)
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
  }
});

function str2oid(str)
{
  return new mongodb.ObjectID(str);
}
