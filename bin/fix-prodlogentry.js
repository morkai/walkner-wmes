'use strict';

var MongoClient = require('mongodb').MongoClient;
var config = require('../config/mongodb');

MongoClient.connect(config.uri, config, function(err, db)
{
  if (err)
  {
    return console.error(err.stack);
  }

  var prodLogEntries = db.collection('prodlogentries');
  var queue = [];
  var fixing = false;
  var fixed = 0;
  var startTime = Date.now();

  prodLogEntries.find({_id: {$type: 7}}, null, {createdAt: 1}).each(function(err, doc)
  {
    if (err)
    {
      return console.error(err.stack);
    }

    if (!doc)
    {
      return console.log('ALL!');
    }

    var oldId = doc._id;

    doc._id = generateId(doc.createdAt, doc.prodShift);

    queue.push({
      _id: oldId,
      doc: doc
    });

    fixNext();
  });

  function fixNext()
  {
    if (fixing)
    {
      return;
    }

    var next = queue.shift();

    if (!next)
    {
      return console.log("Finished in %d ms", Date.now() - startTime);
    }

    fixing = true;

    prodLogEntries.insert(next.doc, {w: 0}, function(err)
    {
      if (err)
      {
        console.error(err.stack);

        fixing = false;

        return fixNext();
      }

      prodLogEntries.remove({_id: next._id}, {w: 1, fsync: true}, function(err)
      {
        if (err)
        {
          console.error(err.stack);
        }
        else
        {
          console.log("Fixed #%d %s -> %s", ++fixed, next._id, next.doc._id);
        }

        fixing = false;

        fixNext();
      });
    });
  }
});

function hashCode(str)
{
  var hash = 0;

  for (var i = 0, l = str.length; i < l; ++i)
  {
    hash = (((hash << 5) - hash) + str.charCodeAt(i)) | 0;
  }

  return hash;
}

function generateId(date, str)
{
  return date.getTime().toString(36)
    + hashCode(str).toString(36)
    + Math.round(Math.random() * 10000000000000000).toString(36);
}
