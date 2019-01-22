/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

db.fapentries.find({analysisNeed: true}, {changes: 1}).forEach(entry =>
{
  let analysisStartedAt = null;
  let analysisFinishedAt = null;

  entry.changes.forEach(change =>
  {
    if (change.data.analysisNeed)
    {
      if (change.data.analysisNeed[1])
      {
        analysisStartedAt = change.date;
      }
      else
      {
        analysisStartedAt = null;
        analysisFinishedAt = null;
      }
    }

    if (change.data.analysisDone)
    {
      if (change.data.analysisDone[1])
      {
        analysisFinishedAt = change.date;
      }
      else
      {
        analysisFinishedAt = null;
      }
    }
  });

  db.fapentries.updateOne({_id: entry._id}, {$set: {analysisStartedAt, analysisFinishedAt}});
});
