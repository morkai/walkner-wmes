/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.productnotes.dropIndex({nc12: 1, target: 1});
db.productnotes.createIndex({codes: 1});
db.productnotes.find({codes: {$exists: false}}).forEach(note =>
{
  note.codes = note.nc12;
  delete note.nc12;
  db.productnotes.replaceOne({_id: note._id}, note);
});
