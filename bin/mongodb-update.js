/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kanbanentries.find({workstations: {$size: 7}}, {workstations: 1, locations: 1}).forEach(k =>
{
  while (k.workstations.length < 10)
  {
    k.workstations.push(0);
    k.locations.push('');
  }

  db.kanbanentries.updateOne({_id: k._id}, {$set: {
    workstations: k.workstations,
    locations: k.locations
  }});
});

db.kaizenproductfamilies.updateMany({mrps: {$exists: false}}, {$set: {mrps: []}});

db.kaizencategories.updateMany({coordSections: {$exists: false}}, {$set: {coordSections: []}});

db.kaizensections.find({'coordinators._id': {$exists: true}}).forEach(s =>
{
  s.coordinators.forEach(u => delete u._id);

  db.kaizensections.updateOne({_id: s._id}, {$set: {coordinators: s.coordinators}});
});

db.kaizensections.find({'confirmers._id': {$exists: true}}).forEach(s =>
{
  s.confirmers.forEach(u => delete u._id);

  db.kaizensections.updateOne({_id: s._id}, {$set: {confirmers: s.confirmers}});
});

db.suggestions.find({'coordSections.0': {$exists: true}}).forEach(s =>
{
  s.coordSections.forEach(section =>
  {
    if (!section.users)
    {
      section.users = [];
    }
  });

  db.suggestions.updateOne({_id: s._id}, {$set: {coordSections: s.coordSections}});
});
