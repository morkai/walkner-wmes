/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

fixKinds('oshnearmisses');
fixKinds('oshkaizens');
fixKinds('oshactions');

function fixKinds(col)
{
  db[col].find({kind: {$type: 'number'}}, {kind: 1, changes: 1}).forEach(d => fixKind(d, col));
}

function fixKind(d, col)
{
  d.kind = [d.kind];

  d.changes.forEach(c =>
  {
    if (!c.data.kind)
    {
      return;
    }

    if (c.data.kind[0])
    {
      c.data.kind[0] = [c.data.kind[0]];
    }

    if (c.data.kind[1])
    {
      c.data.kind[1] = [c.data.kind[1]];
    }
  });

  db[col].updateOne({_id: d._id}, {$set: {kind: d.kind, changes: d.changes}});
}
