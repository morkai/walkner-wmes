/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.users.find({privileges: {$in: ['DOCUMENTS:ACTIVATE', 'OPERATOR:ACTIVATE']}}, {privileges: 1}).forEach(user =>
{
  user.privileges = user.privileges.filter(p => p !== 'DOCUMENTS:ACTIVATE' && p !== 'OPERATOR:ACTIVATE');

  user.privileges.push('OPERATOR:ACTIVATE');

  db.users.updateOne({_id: user._id}, {$set: {privileges: user.privileges}});
});
