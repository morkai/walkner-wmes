/* eslint-disable no-var,quotes,no-unused-vars,no-empty */
/* global ObjectId,db,print,printjson,load */

'use strict';

db.ctpces.aggregate([{$group: {_id: '$order.pso'}}]).forEach(pso =>
{
  pso = db.prodshiftorders.findOne({_id: pso._id}, {sapTaktTime: 1});

  if (!pso)
  {
    return;
  }

  const minCycleTime = 1001;
  const maxCycleTime = pso.sapTaktTime > 0 ? (pso.sapTaktTime * 10 * 1000) : (8 * 3600 * 1000);
  const cycleTime = {
    med: [[]],
    sum: [0],
    avg: [0],
    cnt: [0],
    min: [Number.MAX_SAFE_INTEGER],
    max: [Number.MIN_SAFE_INTEGER]
  };

  const conditions = {
    'order.pso': pso._id
  };
  const fields = {
    station: 1,
    'durations.work': 1
  };
  const order = {
    'durations.work': 1
  };

  db.ctpces.find(conditions, fields).sort(order).forEach(ctPce =>
  {
    const workDuration = ctPce.durations.work;

    if (workDuration < minCycleTime || workDuration > maxCycleTime)
    {
      return;
    }

    const s = ctPce.station;

    if (cycleTime.med[s] === undefined)
    {
      cycleTime.med[s] = [];
      cycleTime.sum[s] = 0;
      cycleTime.avg[s] = 0;
      cycleTime.cnt[s] = 0;
      cycleTime.min[s] = Number.MAX_SAFE_INTEGER;
      cycleTime.max[s] = Number.MIN_SAFE_INTEGER;
    }

    cycleTime.med[0].push(workDuration);
    cycleTime.med[s].push(workDuration);
    cycleTime.sum[0] += workDuration;
    cycleTime.sum[s] += workDuration;
    cycleTime.avg[0] += workDuration;
    cycleTime.avg[s] += workDuration;
    cycleTime.cnt[0] += 1;
    cycleTime.cnt[s] += 1;
    cycleTime.min[0] = Math.min(cycleTime.min[0], workDuration);
    cycleTime.min[s] = Math.min(cycleTime.min[s], workDuration);
    cycleTime.max[0] = Math.max(cycleTime.max[0], workDuration);
    cycleTime.max[s] = Math.max(cycleTime.max[s], workDuration);
  });

  for (let s = 0; s < cycleTime.med.length; ++s)
  {
    if (cycleTime.med[s] === undefined)
    {
      cycleTime.med[s] = 0;
      cycleTime.sum[s] = 0;
      cycleTime.avg[s] = 0;
      cycleTime.cnt[s] = 0;
      cycleTime.min[s] = 0;
      cycleTime.max[s] = 0;

      continue;
    }

    cycleTime.med[s] = Math.round(calcMedian(cycleTime.med[s]));
    cycleTime.avg[s] = Math.round(cycleTime.avg[s] / cycleTime.cnt[s]);

    if (cycleTime.min[s] === Number.MAX_SAFE_INTEGER)
    {
      cycleTime.min[s] = 0;
    }

    if (cycleTime.max[s] === Number.MIN_SAFE_INTEGER)
    {
      cycleTime.max[s] = 0;
    }
  }

  db.prodshiftorders.updateOne({_id: pso._id}, {$set: {'orderData.cycleTime': cycleTime}});
});

function calcMedian(input)
{
  if (input.length === 0)
  {
    return 0;
  }

  if (input.length === 1)
  {
    return input[0];
  }

  if (input.length % 2 === 0)
  {
    return (input[input.length / 2 - 1] + input[input.length / 2]) / 2;
  }

  return input[(input.length + 1) / 2 - 1];
}
