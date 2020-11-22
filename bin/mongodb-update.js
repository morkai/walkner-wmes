/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.plans.find({}, {lines: 1}).forEach(plan =>
{
  plan.lines.forEach(l =>
  {
    if (l.shiftData.length === 3)
    {
      const total = {
        manHours: 0,
        quantity: 0,
        orderCount: 0
      };

      l.shiftData.forEach(shift =>
      {
        total.manHours += shift.manHours;
        total.quantity += shift.quantity;
        total.orderCount += shift.orderCount;
      });

      l.shiftData.unshift(total);
    }

    l.orders.forEach(o =>
    {
      o.pceTimes = [];
    });

    const total = l.shiftData[0];

    if (total.startAt === undefined)
    {
      l.orders.forEach(o =>
      {
        const h = o.startAt.getUTCHours();
        const shift = l.shiftData[h >= 6 && h < 14 ? 1 : h >= 14 && h < 22 ? 2 : 3];

        if (!shift.startAt)
        {
          shift.startAt = o.startAt;
        }

        if (!total.startAt)
        {
          total.startAt = o.startAt;
        }

        shift.finishAt = o.finishAt;
        total.finishAt = o.finishAt;
      });

      l.shiftData.forEach(s =>
      {
        if (!s.startAt)
        {
          s.startAt = null;
          s.finishAt = null;
        }
      });
    }
  });

  db.plans.updateOne({_id: plan._id}, {$set: {lines: plan.lines}});
});
