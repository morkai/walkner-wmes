'use strict';

var mongodb = require('mongodb');
var config = require('../config/mongodb');

mongodb.MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var queue = 0;
  var downtimeReasons = db.collection('downtimereasons');

  downtimeReasons.find().toArray(function(err, docs)
  {
    if (err)
    {
      return done(err);
    }

    docs.forEach(function(doc)
    {
      if (doc.report1 === false)
      {
        doc.type = 'break';
      }
      else if (!doc.type)
      {
        doc.type = 'other';
      }

      delete doc.report1;

      if (!Array.isArray(doc.subdivisionTypes))
      {
        doc.subdivisionTypes = ['assembly', 'press'];
      }

      doc.scheduled = !!doc.scheduled;
      doc.auto = !!doc.auto;

      if (typeof doc.pressPosition !== 'number')
      {
        doc.pressPosition = -1;
      }

      if (typeof doc.opticsPosition !== 'number')
      {
        doc.opticsPosition = -1;
      }

      ++queue;

      downtimeReasons.update({_id: doc._id}, doc, done);
    });
  });

  function done(err)
  {
    --queue;

    if (err)
    {
      return console.error(err.stack);
    }

    if (queue === 0)
    {
      db.close();

      return console.log('ALL DONE!');
    }
  }
});

function str2oid(str)
{
  return new mongodb.ObjectID(str);
}
