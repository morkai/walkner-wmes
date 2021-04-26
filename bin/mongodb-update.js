/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.subdivisions.find({}).forEach(doc =>
{
  if (!doc.autoDowntimes)
  {
    doc.autoDowntimes = [];
  }

  doc.autoDowntimes.forEach(adt =>
  {
    if (!adt.always)
    {
      adt.always = '';
    }
  });

  db.subdivisions.updateOne({_id: doc._id}, {$set: {autoDowntimes: doc.autoDowntimes}});
});

db.settings.updateOne({_id: 'production.lineAutoDowntimes'}, {$set: {
  value: db.settings.findOne({_id: 'production.lineAutoDowntimes'}).value.map(adt =>
  {
    if (!adt.always)
    {
      adt.always = '';
    }

    return adt;
  })
}});
