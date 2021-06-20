/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.prodshiftorders.find({
  startedAt: {$gt: new Date(Date.now() - 2 * 30 * 24 * 3600 * 1000)},
  'orderData.planOrderGroups': {$exists: true}
}, {prodLine: 1, orderData: 1}).forEach(pso =>
{
  db.prodshiftorders.updateOne(
    {_id: pso._id},
    {
      $set: {'orderData.planOrderGroup': pso.orderData.planOrderGroups[pso.prodLine] || null},
      $unset: {'orderData.planOrderGroups': 1}
    }
  );
});
