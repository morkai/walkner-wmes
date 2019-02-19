/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.companies.updateOne({_id: 'PHILIPS'}, {$set: {
  name: 'Signify',
  shortName: 'SGY'
}});

db.sessions.createIndex({'data.user._id': 1}, {background: true});

db.users.find({privileges: {$in: ['PLANNING:WHMAN', 'WH:PROBLEMS']}}).forEach(user =>
{
  db.users.updateOne({_id: user._id}, {$addToSet: {
    privileges: 'WH:VIEW'
  }});

  db.sessions.updateMany({'data.user._id': user._id.valueOf()}, {$addToSet: {
    'data.user.privileges': 'WH:VIEW'
  }});
});

db.whusers.find().forEach(whUser =>
{
  db.users.updateOne({_id: new ObjectId(whUser._id)}, {$addToSet: {privileges: 'WH:VIEW'}});

  db.sessions.updateMany({'data.user._id': whUser._id}, {$addToSet: {
    'data.user.privileges': 'WH:VIEW'
  }});
});
