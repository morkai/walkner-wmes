/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.settings.insertOne({
  _id: 'wh.planning.ignorePsStatus',
  value: false,
  updater: null,
  updatedAt: new Date('2019-07-16T14:27:10.750+02:00')
});
