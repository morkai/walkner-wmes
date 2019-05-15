/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var testers = {};

db.trwtesters.find({}).forEach(tester =>
{
  if (typeof tester._id !== 'string')
  {
    return;
  }

  testers[tester._id] = new ObjectId();

  db.trwtesters.deleteOne({_id: tester._id});

  tester._id = testers[tester._id];

  db.trwtesters.insertOne(tester);
});

db.trwbases.find({}).forEach(base =>
{
  if (typeof base.tester !== 'string')
  {
    return;
  }

  base.tester = testers[base.tester];

  if (!base.tester)
  {
    db.trwbases.deleteOne({_id: base._id});
  }
  else
  {
    db.trwbases.updateOne({_id: base._id}, {$set: {tester: base.tester}});
  }
});

db.trwtests.deleteMany({'program.base._id': {$exists: false}});
