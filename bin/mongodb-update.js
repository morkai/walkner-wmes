/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.oldwhorders.find({funcs: {$size: 3}}).forEach(o =>
{
  o.funcs.splice(2, 0, {
    _id: "platformer",
    user: null,
    startedAt: null,
    finishedAt: null,
    status: "pending",
    picklist: "pending",
    pickup: "pending",
    carts: [],
    problemArea: "",
    comment: ""
  });

  db.oldwhorders.updateOne({_id: o._id}, {$set: {funcs: o.funcs}});
});
