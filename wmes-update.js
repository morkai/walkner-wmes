/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.orderbommatchers.find({}).forEach(obm =>
{
  obm.matchers.line = [];

  db.orderbommatchers.update({_id: obm._id}, {$set: {matchers: obm.matchers}});
});
