/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.fapentries.updateOne({subCategory: {$exists: false}}, {$set: {subCategory: null}});

db. settings.insertMany([
  {
    _id: 'luca.lines',
    value: ['TEST'],
    updater: null,
    updatedAt: null
  },
  {
    _id: 'luca.setLineOrderUrl',
    value: 'https://luca.local/api/setLineOrder',
    updater: null,
    updatedAt: null
  }
]);
