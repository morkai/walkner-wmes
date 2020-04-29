/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.find({funcs: {$size: 3}}).forEach(o =>
{
  var pending = o.status === "pending";

  o.funcs.splice(2, 0, {
    _id: "platformer",
    user: null,
    startedAt: null,
    finishedAt: null,
    status: pending ? "pending" : "finished",
    picklist: pending ? "pending" : "ignore",
    pickup: pending ? "pending" : "ignore",
    carts: [],
    problemArea: "",
    comment: ""
  });

  db.oldwhorders.updateOne({_id: o._id}, {$set: {funcs: o.funcs}});
});

db.oldwhorders.updateMany(
  {packStatus: 'started', fifoStatus: 'finished', 'funcs.3.carts': {$size: 0}},
  {$set: {
    distStatus: 'finished',
    packStatus: 'ignored'
  }}
);
