/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.orderdocumentfiles.createIndex({'components.searchName': 1}, {background: true});

db.orderdocumentfiles.find({components: 1}).forEach(f =>
{
  f.components.forEach(c =>
  {
    c.searchName = c.name.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  });

  if (f.components.length)
  {
    db.orderdocumentfiles.updateOne({_id: f._id}, {$set: {components: f.components}});
  }
});
