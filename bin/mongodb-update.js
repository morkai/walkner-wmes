/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

var kinds = db.oshkinds.find({}).toArray().map(k => k._id);
var types = ['nearMiss', 'kaizen', 'action', 'observation'];

db.oshkinds.find({}).forEach(d =>
{
  if (!d.coordinators.length || !d.coordinators[0].id)
  {
    return;
  }

  var coordinators = [{
    types,
    kinds: [],
    users: d.coordinators
  }];

  db.oshkinds.updateOne({_id: d._id}, {$set: {coordinators}});
});

db.oshdepartments.find({}).forEach(d =>
{
  if (!d.coordinators.length || !d.coordinators[0].id)
  {
    return;
  }

  var coordinators = [{
    types,
    kinds,
    users: d.coordinators
  }];

  db.oshdepartments.updateOne({_id: d._id}, {$set: {coordinators}});
});

db.oshlocations.updateMany({coordinators: {$exists: false}}, {$set: {coordinators: []}});
