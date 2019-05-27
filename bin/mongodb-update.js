/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.trwbases.find({}).forEach(base =>
{
  base.clusters.forEach(cluster =>
  {
    if (!cluster.connector)
    {
      cluster.connector = 'na';
    }

    if (!cluster.image)
    {
      cluster.image = '';
    }
  });

  db.trwbases.replaceOne({_id: base._id}, base);
});
