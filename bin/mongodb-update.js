/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var subdivisionTypes = {};

db.subdivisions.find({}).forEach(sd =>
{
  subdivisionTypes[sd._id] = sd.type;
});

db.pressworksheets.find({}).forEach(pw =>
{
  pw.orders.forEach(o =>
  {
    var so = db.prodshiftorders.findOne({_id: o.prodShiftOrder}, {subdivision: 1});

    if (!so)
    {
      return;
    }

    db.prodshiftorders.updateOne(
      {_id: o.prodShiftOrder},
      {$set: {subdivisionType: subdivisionTypes[so.subdivision]}}
    );

    db.proddowntimes.updateOne(
      {_id: {$in: o.downtimes.map(d => d.prodDowntime)}},
      {$set: {subdivisionType: subdivisionTypes[so.subdivision]}}
    );
  });
});
