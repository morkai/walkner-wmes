/* eslint-disable no-var,quotes,no-unused-vars,no-empty,curly */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.kaizencategories.find({}).forEach(d =>
{
  fixCoordSections(d);

  db.kaizencategories.updateOne({_id: d._id}, {$set: {coordSections: d.coordSections}});
});

function fixCoordSections(d)
{
  if (!d.coordSections) d.coordSections = [];

  d.coordSections.forEach(s =>
  {
    if (!s.filterSections)
    {
      s.filterSections = [];
    }

    if (typeof s.excludeSections !== 'boolean')
    {
      s.excludeSections = false;
    }

    if (typeof s.coordinators !== 'boolean')
    {
      s.coordinators = true;
    }

    if (!s.users)
    {
      s.users = [];
    }
  });
}
