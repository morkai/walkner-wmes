/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.pings.deleteMany({});

db.settings.deleteOne({_id: 'paintShop.drillingWorkCenters'});
db.settings.insertOne({
  _id: 'paintShop.drillingWorkCenters',
  __v: 0,
  updatedAt: new Date('2019-06-18T09:03:32.405Z'),
  updater: null,
  value: ['MILING']
});

db.fapcategories.deleteMany({_id: {$in: [
  new ObjectId('5544b9182b5949f80d80b369'),
  new ObjectId('5c61352b1af9c90ba4c8b28c'),
  new ObjectId('5c134f241f1a7d2ee3fcd33c'),
  new ObjectId('5544b9422b5949f80d80b379'),
  new ObjectId('5cc2ca233b9bc10fac9db80d'),
  new ObjectId('5c134ed71f1a7d2ee3fcd33b'),
  new ObjectId('5bcdce0a46f003084ca86611'),
  new ObjectId('5c2cace1da65f30fc004c8e3'),
  new ObjectId('5c73c5049383030ff4e2ee03'),
  new ObjectId('5544b9402b5949f80d80b377'),
  new ObjectId('5c920e67160fe713649f8c75'),
  new ObjectId('5c9b1a73070b3a0c6c92bc90')
]}});
