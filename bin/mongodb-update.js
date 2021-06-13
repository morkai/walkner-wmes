/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.qiresults.find({ok: false}, {correctiveActions: 1}).forEach(d =>
{
  d.correctiveActions.forEach(a =>
  {
    a.kind = 'std';
    a.rid = 0;

    if (a.status === 'new')
    {
      a.status = 'inProgress';
    }
  });

  db.qiresults.updateOne({_id: d._id}, {$set: {correctiveActions: d.correctiveActions}});
});

db.qiresults.createIndex({'correctiveActions.rid': 1});
