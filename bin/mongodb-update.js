/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.comprelentries.dropIndex({oldCode: 1});
db.comprelentries.dropIndex({newCode: 1});
db.comprelentries.createIndex({'oldComponents._id': 1});
db.comprelentries.createIndex({'newComponents._id': 1});

db.comprelentries.find({newComponents: {$exists: false}}).forEach(compRel =>
{
  const newComponents = [{
    _id: compRel.newCode,
    name: compRel.newName
  }];

  db.comprelentries.updateOne({_id: compRel._id}, {
    $unset: {
      newCode: 1,
      newName: 1
    },
    $set: {
      newComponents
    }
  });
});
