/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.xiconfresults.dropIndex('nc12_1');
db.xiconfresults.dropIndex('srcId_1');
db.xiconfresults.dropIndex('serviceTag_1');
db.xiconfresults.dropIndex('result_1');
db.xiconfresults.dropIndex('orderNo_1');

db.xiconfresults.find({}).forEach(r =>
{
  const search = {};

  if (r.orderNo)
  {
    search[r.orderNo] = 1;
  }

  if (r.serviceTag)
  {
    search[r.serviceTag.toUpperCase()] = 1;
  }

  if (r.nc12)
  {
    search[r.nc12.toUpperCase()] = 1;
  }

  if (r.program)
  {
    search[r.program._id.toUpperCase()] = 1;
  }

  (r.leds || []).forEach(led =>
  {
    search[led.nc12] = 1;
    search[led.serialNumber.toUpperCase()] = 1;
  });

  (r.hidLamps || []).forEach(hid =>
  {
    search[hid.nc12] = 1;
  });

  (r.log || []).forEach(log =>
  {
    if (log.nc12)
    {
      search[log.nc12] = 1;
    }
  });

  delete search[''];
  delete search.null;
  delete search.undefined;

  db.xiconfresults.updateOne({_id: r._id}, {$set: {search: Object.keys(search)}});
});

db.xiconfresults.createIndex({search: 1, startedAt: -1}, {background: true});
db.xiconfresults.createIndex({prodLine: 1, startedAt: -1}, {background: true});
db.xiconfresults.createIndex({result: 1, startedAt: -1}, {background: true});
