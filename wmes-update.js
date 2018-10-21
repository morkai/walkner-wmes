/* eslint-disable */
/* global ObjectId,db,print */

'use strict';

db.plans.find({}, {orders: 1}).forEach(plan =>
{
  print(plan._id);

  plan.orders.forEach(planOrder =>
  {
    if (!planOrder.operation)
    {
      return;
    }

    const sapOrder = db.orders.findOne({_id: planOrder._id}, {operations: 1});

    if (!sapOrder || !sapOrder.operations)
    {
      return;
    }

    sapOrder.operations.forEach(op =>
    {
      if (op.name === planOrder.operation.name)
      {
        planOrder.operation.workCenter = op.workCenter;
      }
    });
  });

  db.plans.update({_id: plan._id}, {$set: {orders: plan.orders}});
});

db.plansettings.update({}, {$set: {ignoredWorkCenters: ['WIRE A', 'WIRE C', 'WIRE D']}}, {multi: true});
