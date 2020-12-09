/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kaizenorders.find({}, {nearMissOwners: 1, suggestionOwners: 1, kaizenOwners: 1}).forEach(kz =>
{
  var map = {};

  ['nearMissOwners', 'suggestionOwners', 'kaizenOwners'].forEach(prop =>
  {
    kz[prop].forEach(owner =>
    {
      if (!map[owner.id])
      {
        map[owner.id] = [];
      }

      map[owner.id].push(owner);
    });
  });

  var users = db.users.find({_id: {$in: Object.keys(map).map(id => new ObjectId(id))}}, {company: 1}).toArray();

  users.forEach(user =>
  {
    map[user._id.valueOf()].forEach(owner =>
    {
      owner.company = user.company || null;
    });
  });

  db.kaizenorders.updateOne({_id: kz._id}, {$set: kz});
});
