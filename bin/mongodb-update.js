/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.qiresults.find({}, {rootCause: 1, changes: 1}).forEach(qiResult =>
{
  if (Array.isArray(qiResult.rootCause))
  {
    return;
  }

  qiResult.rootCause = convertRootCause(qiResult.rootCause);

  qiResult.changes.forEach(change =>
  {
    if (change.data.rootCause)
    {
      change.data.rootCause = change.data.rootCause.map(convertRootCause);
    }
  });

  db.qiresults.updateOne({_id: qiResult._id}, {$set: {
    rootCause: qiResult.rootCause,
    changes: qiResult.changes
  }});
});

function convertRootCause(old)
{
  return (old || '')
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => /[a-zA-Z0-9]+/.test(line));
}
