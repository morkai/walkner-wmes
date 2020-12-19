/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var insert = [];
var remove = [];

db.paintshoploads.find({_id: {$type: 'date'}}).forEach(doc =>
{
  remove.push(doc._id);
  insert.push(doc);

  doc._id = {
    ts: doc._id,
    c: 1
  };
  doc.r = null;

  if (remove.length === 500)
  {
    update();
  }
});

update();

function update()
{
  if (remove.length)
  {
    db.paintshoploads.deleteMany({_id: {$in: remove}});
  }

  if (insert.length)
  {
    db.paintshoploads.insertMany(insert);
  }

  remove = [];
  insert = [];
}
