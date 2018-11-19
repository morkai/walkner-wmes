/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.events.find({time: {$gt: 1542499200000}, user: null, 'data.user.privileges': {$exists: true}}).forEach(event =>
{
  const userData = event.data.user;
  const user = {
    _id: String(userData._id || userData.id),
    name: userData.lastName && userData.firstName
      ? (userData.lastName + ' ' + userData.firstName)
      : (userData.login || userData.label),
    login: userData.login || userData.label,
    ipAddress: userData.ipAddress || userData.ip
  };

  db.events.updateOne({_id: event._id}, {$unset: {'data.user': 1}, $set: {user: user}});
});
