// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');

module.exports = function getProductionHistoryRoute(app, productionModule, req, res, next)
{
  const mongoose = app[productionModule.config.mongooseId];
  const ProdShift = mongoose.model('ProdShift');
  const ProdShiftOrder = mongoose.model('ProdShiftOrder');
  const ProdDowntime = mongoose.model('ProdDowntime');

  const query = req.query;
  const from = parseInt(query.from, 10);
  const to = parseInt(query.to, 10);
  const shifts = (query.shifts || '').split(',').map(Number).filter(function(val) { return val >= 1 && val <= 3; });
  const orgUnitField = query.orgUnitType === 'mrpController' ? 'mrpControllers' : query.orgUnitType;
  const orgUnitIds = (query.orgUnitIds || '').split(',');

  const week = 7 * 24 * 3600 * 1000;

  if (isNaN(from) || isNaN(to) || !orgUnitField || !orgUnitIds.length || from >= to || (to - from) > week)
  {
    return res.sendStatus(400);
  }

  const prodLineStateMap = {};

  step(
    function()
    {
      const conditions = {
        date: {$gt: new Date(from), $lt: new Date(to)}
      };

      if (orgUnitIds.length === 1 && orgUnitIds[0].length)
      {
        conditions[orgUnitField] = orgUnitIds[0];
      }
      else if (orgUnitIds.length > 1)
      {
        conditions[orgUnitField] = {$in: orgUnitIds};
      }

      if (shifts.length === 1)
      {
        conditions.shift = shifts[0];
      }
      else if (shifts.length === 2)
      {
        conditions.shift = {$in: shifts};
      }

      const fields = {
        prodLine: 1,
        date: 1,
        shift: 1,
        quantitiesDone: 1,
        master: 1,
        leader: 1,
        operator: 1
      };

      ProdShift.find(conditions, fields).lean().exec(this.next());
    },
    function(err, prodShifts)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (prodShifts.length === 0)
      {
        return;
      }

      const now = Date.now();

      _.forEach(prodShifts, function(prodShift)
      {
        let plannedQuantityDone = 0;
        let actualQuantityDone = 0;

        for (let h = 0; h < 8; ++h)
        {
          plannedQuantityDone += prodShift.quantitiesDone[h].planned;
          actualQuantityDone += prodShift.quantitiesDone[h].actual;
        }

        prodLineStateMap[prodShift._id] = {
          _id: prodShift._id,
          v: 0,
          state: null,
          stateChangedAt: now,
          online: true,
          extended: false,
          plannedQuantityDone: plannedQuantityDone,
          actualQuantityDone: actualQuantityDone,
          prodShift: prodShift,
          prodShiftOrders: [],
          prodDowntimes: []
        };
      });

      setImmediate(this.next());
    },
    function()
    {
      const conditions = {prodShift: {$in: Object.keys(prodLineStateMap)}};
      const orderFields = {
        prodShift: 1,
        orderId: 1,
        operationNo: 1,
        workerCount: 1,
        quantityDone: 1,
        totalQuantity: 1,
        startedAt: 1,
        finishedAt: 1,
        workDuration: 1,
        laborTime: 1,
        sapTaktTime: 1,
        lastTaktTime: 1,
        avgTaktTime: 1
      };
      const downtimeFields = {
        prodShift: 1,
        prodShiftOrder: 1,
        aor: 1,
        reason: 1,
        startedAt: 1,
        finishedAt: 1
      };

      ProdShiftOrder.find(conditions, orderFields).lean().exec(this.parallel());
      ProdDowntime.find(conditions, downtimeFields).lean().exec(this.parallel());
    },
    function(err, prodShiftOrders, prodDowntimes)
    {
      if (err)
      {
        return this.skip(err);
      }

      _.forEach(prodShiftOrders, function(prodShiftOrder)
      {
        prodLineStateMap[prodShiftOrder.prodShift].prodShiftOrders.push(prodShiftOrder);
      });

      _.forEach(prodDowntimes, function(prodDowntime)
      {
        prodLineStateMap[prodDowntime.prodShift].prodDowntimes.push(prodDowntime);
      });

      setImmediate(this.next());
    },
    function(err)
    {
      if (err)
      {
        return next(err);
      }

      return res.json({
        prodLineStates: _.values(prodLineStateMap).sort(function(a, b)
        {
          return a.prodShift.date - b.prodShift.date;
        })
      });
    }
  );
};
