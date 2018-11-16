/* eslint-disable no-var,quotes,no-unused-vars */
/* global ObjectId,db,print,printjson,load */

'use strict';

load('./mongodb-helpers.js');

const MUTATE = true;
const START_DATE = new Date('2018-11-16T05:00:00.000Z');
const END_DATE = new Date('2018-11-16T13:00:00.000Z');
const HOUR_TO_INDEX = [
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1,
  2, 3, 4, 5, 6, 7, 0, 1
];

const cache = {
  taktTime: {
    ignoredLines: db.settings.findOne({_id: 'production.taktTime.ignoredLines'}).value.split(','),
    ignoredDowntimes: db.settings.findOne({_id: 'production.taktTime.ignoredDowntimes'}).value
  },
  downtimeReasons: {}
};

db.downtimereasons.find({}).forEach(d => cache.downtimeReasons[d._id] = d);

const lineToShifts = {};
const conditions = {
  date: {
    $gte: START_DATE,
    $lt: END_DATE
  }
};

db.prodshifts.find(conditions, {prodLine: 1}).sort({createdAt: 1}).forEach(ps =>
{
  if (!lineToShifts[ps.prodLine])
  {
    lineToShifts[ps.prodLine] = [];
  }

  lineToShifts[ps.prodLine].push(ps._id);
});

Object.keys(lineToShifts).forEach(line =>
{
  if (lineToShifts[line].length === 1)
  {
    delete lineToShifts[line];
  }
});

Object.keys(lineToShifts).forEach(lineId =>
{
  console.log(`${lineId}`, Object.keys(lineToShifts[lineId]).length);

  const nokShifts = [];
  const allOrders = [];

  lineToShifts[lineId].forEach(shiftId =>
  {
    const shift = db.prodshifts.findOne({_id: shiftId});

    shift.orders = db.prodshiftorders.find({prodShift: shiftId}).sort({startedAt: 1}).toArray().map(o =>
    {
      if (!o.finishedAt)
      {
        o.finishedAt = END_DATE;
      }

      o.dts = db.proddowntimes.find({prodShiftOrder: o._id}).sort({startedAt: 1}).toArray().map(dt =>
      {
        if (!dt.finishedAt)
        {
          dt.finishedAt = o.finishedAt;
        }

        return dt;
      });
      o.sns = db.prodserialnumbers.find({prodShiftOrder: o._id}).sort({scannedAt: 1}).toArray();

      allOrders.push(o);

      return o;
    });

    shift.plannedQty = 0;

    shift.quantitiesDone.forEach(q => shift.plannedQty += q.planned);

    if (shift.orders.length === 0)
    {
      removeShift(null, shift);

      return;
    }

    nokShifts.push(shift);
  });

  if (!nokShifts.length)
  {
    return;
  }

  nokShifts.sort((a, b) => b.plannedQty - a.plannedQty);

  const okShift = nokShifts[0];

  okShift.date = START_DATE;

  nokShifts.forEach(shift =>
  {
    ['master', 'leader', 'operator', 'operators'].forEach(p =>
    {
      if (shift[p])
      {
        okShift[p] = shift[p];
      }
    });
  });

  const okOrders = [];

  while (allOrders.length)
  {
    const okOrder = allOrders.shift();
    const nokOrders = [];

    okOrder.okSns = [];
    okOrder.totalQuantity = 0;
    okOrder.quantityDone = 0;

    while (allOrders.length)
    {
      if (allOrders[0].orderId === okOrder.orderId)
      {
        const nokOrder = allOrders.shift();

        okOrder.finishedAt = new Date(Math.max(okOrder.finishedAt, nokOrder.finishedAt));
        okOrder.workerCount = Math.max(okOrder.workerCount, nokOrder.workerCount);
        okOrder.dts = okOrder.dts.concat(nokOrder.dts);

        incOrderQty(okShift, okOrder, nokOrder.sns);

        nokOrder.okOrder = okOrder;

        nokOrders.push(nokOrder);
      }
      else
      {
        break;
      }
    }

    incOrderQty(okShift, okOrder, okOrder.sns);

    if (!okOrder.quantityDone)
    {
      const orderIds = [okOrder._id].concat(nokOrders.map(o => o._id));
      const ple = db.prodlogentries.find({
        createdAt: {$gte: START_DATE, $lt: END_DATE},
        type: 'changeQuantityDone',
        prodShiftOrder: {$in: orderIds},
        'data.newValue': {$gt: 0}
      }).sort({createdAt: -1}).toArray();

      if (ple.length)
      {
        okOrder.totalQuantity = okOrder.quantityDone = ple[ple.length - 1].data.newValue;
      }
    }

    okOrder.prodShift = okShift._id;
    okOrder.nokOrders = nokOrders;

    okOrders.push(okOrder);

    okOrder.nokOrders.forEach(nokOrder => removeOrder(okOrder, nokOrder));
  }

  okOrders.forEach((order, i) =>
  {
    const nextOrder = okOrders[i + 1];

    order.finishedAt = new Date((nextOrder ? nextOrder.startedAt : order.finishedAt).getTime() - 1);

    if (MUTATE)
    {
      db.prodlogentries.updateOne(
        {type: 'finishOrder', prodShiftOrder: order._id},
        {$set: {'data.finishedAt': order.finishedAt.toISOString()}}
      );
    }
  });

  okShift.dts = [];

  okOrders.forEach(okOrder =>
  {
    const okDts = [];

    okOrder.dts.sort((a, b) => a.startedAt - b.startedAt);

    while (okOrder.dts.length)
    {
      const okDt = okOrder.dts.shift();
      const nokDts = [];

      okDt.longestFinishedAt = okDt.finishedAt;

      while (okOrder.dts.length)
      {
        if (okOrder.dts[0].orderId === okDt.orderId)
        {
          const nokDt = okOrder.dts.shift();

          okDt.longestFinishedAt = new Date(Math.max(okDt.longestFinishedAt, nokDt.finishedAt));

          nokDt.okDt = okDt;

          nokDts.push(nokDt);
        }
        else
        {
          break;
        }
      }

      okDt.prodShift = okShift._id;
      okDt.prodShiftOrder = okOrder._id;
      okDt.nokDts = nokDts;

      okDts.push(okDt);

      okDt.nokDts.forEach(nokDt => removeDt(okDt, nokDt));
    }

    okOrder.dts = okDts;
    okShift.dts = okShift.dts.concat(okDts);
  });

  if (!MUTATE)
  {
    return;
  }

  nokShifts.shift();
  nokShifts.forEach(nokShift => removeShift(okShift, nokShift));

  recalcShiftTimes(okShift, okOrders, okShift.dts);

  const orderMrps = new Set();
  let effNum = 0;
  let effDen = 0;

  okOrders.forEach(okOrder =>
  {
    okOrder.okShift = okShift;

    orderMrps.add(okOrder.orderData.mrp);

    fixOrderSns(okOrder);

    if (okOrder.laborTime && okOrder.workDuration && okOrder.workerCount)
    {
      effNum += okOrder.laborTime / 100 * okOrder.totalQuantity;
      effDen += okOrder.workDuration * okOrder.workerCount;
    }

    okOrder.totalDuration = (okOrder.finishedAt - okOrder.startedAt) / 3600000;
    okOrder.breakDuration = 0;
    okOrder.downtimeDuration = 0;

    okOrder.dts.forEach(okDt =>
    {
      db.proddowntimes.updateOne({_id: okDt._id}, {$set: {
        date: okShift.date,
        prodShift: okShift._id,
        master: okShift.master,
        leader: okShift.leader,
        operator: okShift.operator,
        operators: okShift.operators,
        prodShiftOrder: okOrder._id,
        workerCount: okOrder.workerCount,
        startedAt: okDt.startedAt,
        finishedAt: okDt.finishedAt
      }});

      const reason = cache.downtimeReasons[okDt.reason];
      const property = reason && reason.type === 'break' ? 'breakDuration' : 'downtimeDuration';

      okOrder[property] += (okDt.finishedAt - okDt.startedAt) / 3600000;
    });

    okOrder.workDuration = okOrder.totalDuration - okOrder.breakDuration;

    db.prodshiftorders.updateOne({_id: okOrder._id}, {$set: {
      date: okShift.date,
      prodShift: okShift._id,
      master: okShift.master,
      leader: okShift.leader,
      operator: okShift.operator,
      operators: okShift.operators,
      totalQuantity: okOrder.totalQuantity,
      quantityDone: okOrder.quantityDone,
      workerCount: okOrder.workerCount,
      startedAt: okOrder.startedAt,
      finishedAt: okOrder.finishedAt,
      totalDuration: okOrder.totalDuration,
      breakDuration: okOrder.breakDuration,
      downtimeDuration: okOrder.downtimeDuration,
      workDuration: okOrder.workDuration,
      sapTaktTime: okOrder.sapTaktTime,
      avgTaktTime: okOrder.avgTaktTime,
      lastTaktTime: okOrder.lastTaktTime
    }});
  });

  db.prodshifts.updateOne({_id: okShift._id}, {$set: {
    date: okShift.date,
    quantitiesDone: okShift.quantitiesDone,
    master: okShift.master,
    leader: okShift.leader,
    operator: okShift.operator,
    operators: okShift.operators,
    orderMrp: Array.from(orderMrps),
    efficiency: effDen ? (effNum / effDen) : 0,
    startup: okShift.startup,
    shutdown: okShift.shutdown,
    idle: okShift.idle,
    working: okShift.working,
    downtime: okShift.downtime
  }});
});

function incOrderQty(okShift, okOrder, sns)
{
  okOrder.totalQuantity += sns.length;
  okOrder.quantityDone += sns.length;

  sns.forEach(sn =>
  {
    okOrder.okSns.push(sn);

    okShift.quantitiesDone[HOUR_TO_INDEX[sn.scannedAt.getHours()]].actual += 1;

    sn.prodShiftOrder = okOrder._id;
  });

  if (!MUTATE)
  {
    return;
  }

  const snsIds = sns.map(sn => sn._id);

  db.prodserialnumbers.updateMany({_id: {$in: snsIds}}, {$set: {
    prodShiftOrder: okOrder._id
  }});
  db.prodlogentries.updateMany({
    type: 'checkSerialNumber',
    prodLine: okOrder.prodLine,
    createdAt: {$gte: START_DATE},
    'data._id': {$in: snsIds}
  }, {$set: {
    prodShift: okOrder.prodShift,
    prodShiftOrder: okOrder._id
  }});
}

function shiftInfo(s)
{
  return {
    _id: s._id,
    date: s.date,
    quantitiesDone: s.quantitiesDone
  };
}

function orderInfo(o)
{
  return {
    _id: o._id,
    no: o.orderId,
    startedAt: o.startedAt,
    finishedAt: o.finishedAt,
    quantityDone: o.quantityDone
  };
}

function removeShift(okShift, nokShift)
{
  if (!MUTATE)
  {
    return;
  }

  db.prodshifts.deleteOne({
    _id: nokShift._id
  });

  if (!okShift)
  {
    db.prodlogentries.deleteMany({
      prodShift: nokShift._id
    });

    return;
  }

  db.prodlogentries.deleteMany({
    type: 'changeShift',
    prodShift: nokShift._id
  });

  db.prodlogentries.updateMany({
    prodShift: nokShift._id
  }, {$set: {
    prodShift: okShift._id
  }});
}

function removeOrder(okOrder, nokOrder)
{
  if (!MUTATE)
  {
    return;
  }

  db.prodshiftorders.deleteOne({
    _id: nokOrder._id
  });

  db.prodlogentries.deleteMany({
    type: {$in: ['changeOrder', 'finishOrder']},
    prodShiftOrder: nokOrder._id
  });

  db.prodlogentries.updateMany({
    prodShiftOrder: nokOrder._id
  }, {$set: {
    prodShiftOrder: okOrder._id,
    prodShift: okOrder.prodShift
  }});
}

function removeDt(okDt, nokDt)
{
  if (!MUTATE)
  {
    return;
  }

  db.proddowntimes.deleteOne({
    _id: nokDt._id
  });

  db.prodlogentries.deleteMany({
    type: {$in: ['startDowntime', 'finishDowntime']},
    createdAt: {$gte: START_DATE},
    prodLine: nokDt.prodLine,
    'data._id': nokDt._id
  });
}

function recalcShiftTimes(shift, orders, downtimes)
{
  const shiftStartTime = shift.date.getTime();
  const shiftEndTime = shiftStartTime + 8 * 3600 * 1000;
  const lastOrder = orders.length ? orders[orders.length - 1] : null;
  const lastDowntime = downtimes.length ? downtimes[downtimes.length - 1] : null;
  let shiftStartedAt = Math.min(
    orders.length ? orders[0].startedAt.getTime() : Number.MAX_VALUE,
    downtimes.length ? downtimes[0].startedAt.getTime() : Number.MAX_VALUE
  );
  let shiftFinishedAt = Math.max(
    lastOrder && lastOrder.finishedAt ? lastOrder.finishedAt.getTime() : Number.MIN_VALUE,
    lastDowntime && lastDowntime.finishedAt ? lastDowntime.finishedAt.getTime() : Number.MIN_VALUE
  );

  if (shiftStartedAt === Number.MAX_VALUE)
  {
    shiftStartedAt = shiftStartTime;
  }

  if (shiftFinishedAt === Number.MIN_VALUE)
  {
    shiftFinishedAt = shiftEndTime;
  }

  shift.startup = Math.max(0, shiftStartedAt - shiftStartTime);
  shift.shutdown = Math.max(0, shiftEndTime - shiftFinishedAt);

  let working = 0;
  let downtime = 0;

  for (let o = 0; o < orders.length; ++o)
  {
    const order = orders[o];

    if (order.finishedAt)
    {
      working += order.finishedAt.getTime() - order.startedAt.getTime();
    }
  }

  for (let d = 0; d < downtimes.length; ++d)
  {
    const dt = downtimes[d];

    if (dt.finishedAt)
    {
      const duration = dt.finishedAt.getTime() - dt.startedAt.getTime();

      working -= duration;
      downtime += duration;
    }
  }

  shift.idle = shiftEndTime - shiftStartTime - working - downtime;
  shift.working = working;
  shift.downtime = downtime;
}

function fixOrderSns(okOrder)
{
  const sns = okOrder.okSns;

  okOrder.sapTaktTime = getSapTaktTime(okOrder);

  if (!sns.length)
  {
    return;
  }

  let totalTaktTime = 0;

  sns.forEach((sn, i) =>
  {
    fixOrderSn(okOrder, sn, sns[i - 1]);

    totalTaktTime += sn.taktTime;
  });

  const quantityDone = sns.length;

  okOrder.avgTaktTime = Math.round((totalTaktTime / quantityDone) || 0);
  okOrder.lastTaktTime = sns[sns.length - 1].taktTime;
}

function fixOrderSn(pso, sn, previousSn)
{
  var shift = pso.okShift;

  sn.taktTime = 0;

  const previousScannedAt = (previousSn ? previousSn.scannedAt : pso.startedAt).getTime();
  const latestScannedAt = sn.scannedAt.getTime();
  let ignoredDuration = 0;

  pso.dts.forEach(d =>
  {
    if (d.startedAt >= previousScannedAt && d.finishedAt <= latestScannedAt)
    {
      ignoredDuration += d.finishedAt - d.startedAt;
    }
  });

  sn.taktTime = latestScannedAt - previousScannedAt - ignoredDuration;

  if (sn.iptAt)
  {
    const previousIptAt = previousSn ? previousSn.iptAt : pso.startedAt;
    const latestIptAt = sn.iptAt;
    const iptTaktTime = previousIptAt ? (latestIptAt.getTime() - previousIptAt.getTime()) : 0;

    if (iptTaktTime)
    {
      sn.iptTaktTime = iptTaktTime - ignoredDuration;
    }
  }

  db.prodserialnumbers.updateOne({_id: sn._id}, {$set: {
    taktTime: sn.taktTime,
    iptTaktTime: sn.iptTaktTime,
    sapTaktTime: pso.sapTaktTime
  }});
}

function getSapTaktTime(okOrder)
{
  var operation = okOrder.orderData.operations[okOrder.operationNo];
  var coeff = getTaktTimeCoeff(okOrder.orderData.mrp, operation.workCenter);

  return Math.max(Math.round((operation.laborTime * coeff) / okOrder.workerCount * 3600 / 100), 1);
}

function getTaktTimeCoeff(mrp, workCenter)
{
  var mrpCoeffs = cache.taktTimeCoeffs;

  if (!mrpCoeffs)
  {
    mrpCoeffs = cache.taktTimeCoeffs = mapTaktTimeCoeffs(db.settings.findOne({_id: 'production.taktTime.coeffs'}).value);
  }

  var wcCoeffs = mrpCoeffs[mrp] || mrpCoeffs['*'] || {};

  if (!wcCoeffs)
  {
    return 1;
  }

  return wcCoeffs[workCenter] || wcCoeffs['*'] || 1;
}

function mapTaktTimeCoeffs(value)
{
  var mrpCoeffs = {};

  value.split('\n').forEach(function(line)
  {
    var wcCoeffs = {};
    var remaining = line;
    var re = /([A-Z0-9]+[A-Z0-9_\- ]*|\*)\s*=\s*([0-9]+(?:(?:\.|,)[0-9]+)?)/ig;
    var matchCount = 0;
    var match;

    while ((match = re.exec(line)) !== null) // eslint-disable-line no-cond-assign
    {
      wcCoeffs[match[1].toUpperCase()] = parseFloat(match[2].replace(',', '.'));
      remaining = remaining.replace(match[0], '');
      matchCount += 1;
    }

    var mrp = remaining.indexOf('*') === -1 ? remaining.split(/[^A-Za-z0-9]/)[0].toUpperCase() : '*';

    if (matchCount && mrp.length)
    {
      mrpCoeffs[mrp] = wcCoeffs;
    }
  });

  return mrpCoeffs;
}
