/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

const time = new Date();
const user = {
  id: null,
  label: 'System'
};

db.orderdocumentchanges.deleteMany({});

db.orderdocumentfiles.find({}).forEach(f =>
{
  db.orderdocumentchanges.insertOne({
    time,
    user,
    type: 'fileAdded',
    nc15: f._id,
    data: f
  });
});
