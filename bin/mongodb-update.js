/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oshnearmisses.find().sort({createdAt: 1}).toArray().forEach(updateRid.bind(null, 'oshnearmisses', 'Z'));
db.oshkaizens.find().sort({createdAt: 1}).toArray().forEach(updateRid.bind(null, 'oshkaizens', 'K'));

function updateRid(c, p, entry, i)
{
  db[c].updateOne({_id: entry._id}, {$set: {
    ridInc: i + 1,
    rid: `${p}-2020-${(i + 1).toString().padStart(6, '0')}`
  }});
}
