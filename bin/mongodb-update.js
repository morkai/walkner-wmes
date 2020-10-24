/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshactivitykinds.updateMany({rootCauses: {$exists: false}}, {$set: {rootCauses: false}});
db.oshactivitykinds.updateMany({implementers: {$exists: false}}, {$set: {implementers: false}});
db.oshactivitykinds.updateMany({participants: {$exists: false}}, {$set: {participants: false}});

db.oshnearmisses.find().sort({createdAt: 1}).toArray().forEach(updateEntry.bind(null, 'oshnearmisses', 'Z'));
db.oshkaizens.find().sort({createdAt: 1}).toArray().forEach(updateEntry.bind(null, 'oshkaizens', 'K'));

function updateEntry(c, p, entry, i)
{
  const $unset = {xxx: 1};
  const $set = {
    ridInc: i + 1,
    rid: `${p}-2020-${(i + 1).toString().padStart(6, '0')}`
  };

  if (entry.participants)
  {
    $set.users = entry.participants;
    $unset.participants = 1;
  }

  db[c].updateOne({_id: entry._id}, {$unset, $set});
}
