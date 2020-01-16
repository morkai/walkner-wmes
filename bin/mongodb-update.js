/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var subdivisionTypes = {};

db.subdivisions.find({}).forEach(sd =>
{
  subdivisionTypes[sd._id] = sd.type;
});

var startDate = new Date('2014-11-30T23:00:00.000Z');
var endDate = new Date(Date.now() + 7 * 24 * 3600 * 1000);

while (startDate < endDate)
{
  print(startDate.toLocaleString());

  var from = startDate;

  startDate = new Date(startDate.getTime() + 24 * 3600 * 1000);

  var to = startDate;
  var psoCount = 0;

  db.prodshiftorders.find({startedAt: {$gte: from, $lt: to}, subdivisionType: null}, {subdivision: 1}).forEach(pso =>
  {
    pso.subdivisionType = subdivisionTypes[pso.subdivision.toString()];

    if (pso.subdivisionType)
    {
      db.prodshiftorders.updateOne({_id: pso._id}, {$set: {subdivisionType: pso.subdivisionType}});
      db.proddowntimes.updateOne({prodShiftOrder: pso._id}, {$set: {subdivisionType: pso.subdivisionType}});

      ++psoCount;
    }
  });

  print(psoCount);

  var h = startDate.getHours();

  if (h !== 0)
  {
    startDate = new Date(startDate.getTime() - 3600 * 1000 * h);
  }
}
