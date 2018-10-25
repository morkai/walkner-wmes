/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.pfepentries.find({}, {packType: 1}).forEach(d =>
{
  if (!/^[A-Z]+$/i.test(d.packType))
  {
    return;
  }

  var packType = d.packType.toLowerCase();

  db.pfepentries.updateOne({_id: d._id}, {$set: {
    packType: packType.substring(0, 1).toUpperCase() + packType.substring(1)
  }})
});
