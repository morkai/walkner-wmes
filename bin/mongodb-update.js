/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

var from = new Date('2013-12-01 06:00:00');
var now = Date.now();

while (from.getTime() <= now)
{
  var to = nextShift(from);

  print(`${from}...`);
  print(`${to}...`);

  var conditions = {
    startedAt: {
      $gte: from,
      $lt: to
    }
  };
  var fields = {
    prodShift: 1,
    laborTime: 1,
    workDuration: 1,
    workerCount: 1,
    totalQuantity: 1,
    operationNo: 1,
    'orderData.taktTimeCoeff': 1,
    'orderData.operations': 1
  };
  var updates = [];
  var shifts = {};

  db.prodshiftorders.find(conditions).projection(fields).forEach(pso =>
  {
    if (!shifts[pso.prodShift])
    {
      shifts[pso.prodShift] = {num: 0, den: 0, pso: []};
    }

    pso.taktTimeCoeff = getTaktTimeCoeff(pso);

    shifts[pso.prodShift].pso.push(pso);

    if (pso.laborTime && pso.workDuration && pso.workerCount)
    {
      shifts[pso.prodShift].num += pso.laborTime * pso.taktTimeCoeff / 100 * pso.totalQuantity;
      shifts[pso.prodShift].den += pso.workDuration * pso.workerCount;
    }
  });

  Object.keys(shifts).forEach(id =>
  {
    var eff = shifts[id];

    updates.push({
      updateOne: {
        filter: {_id: id},
        update: {$set: {efficiency: eff.den ? eff.num / eff.den : 0}}
      }
    });
  });

  print(`...${updates.length}`);

  if (updates.length)
  {
    db.prodshifts.bulkWrite(updates, {ordered: false});
  }

  from = nextShift(from);
}

function getTaktTimeCoeff(pso)
{
  const taktTimeCoeffs = pso.orderData && pso.orderData.taktTimeCoeff;

  if (!taktTimeCoeffs)
  {
    return 1;
  }

  const operation = pso.orderData && pso.orderData.operations && pso.orderData.operations[pso.operationNo] || null;

  if (!operation)
  {
    return 1;
  }

  return taktTimeCoeffs[operation.workCenter] || taktTimeCoeffs['*'] || 1;
}

function nextShift(date)
{
  date = new Date(date.getTime());

  if (date.getHours() === 22)
  {
    date = new Date(date.getTime() + 22 * 3600 * 1000);
    date.setHours(6);
  }
  else if (date.getHours() === 14)
  {
    date.setHours(22);
  }
  else
  {
    date.setHours(14);
  }

  return date;
}
