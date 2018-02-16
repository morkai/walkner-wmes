// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');
const moment = require('moment');

module.exports = function getOrderQueue(app, productionModule, prodShiftId, done)
{
  const mongoose = app[productionModule.config.mongooseId];
  const PlanSettings = mongoose.model('PlanSettings');
  const Plan = mongoose.model('Plan');
  const Order = mongoose.model('Order');

  step(
    function()
    {
      const prodLine = app[productionModule.config.orgUnitsId].getByTypeAndId('prodLine', prodShiftId);

      if (prodLine)
      {
        prodShiftId = productionModule.getProdLineState(prodLine._id).getCurrentShiftId();
      }

      productionModule.getProdData('shift', prodShiftId, this.next());
    },
    function(err, prodShift)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find shift: ${err.message}`, 500));
      }

      setTimeout(this.next(), prodShift ? 0 : 2000, null, prodShift);
    },
    function(err, prodShift) // eslint-disable-line handle-callback-err
    {
      if (prodShift)
      {
        setImmediate(this.parallel(), null, prodShift);
      }
      else
      {
        productionModule.getProdData('shift', prodShiftId, this.parallel());
      }

      productionModule.getProdShiftOrders(prodShiftId, this.parallel());
    },
    function(err, prodShift, prodShiftOrders)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find shift: ${err.message}`, 500));
      }

      if (!prodShift)
      {
        return this.skip(app.createError('Shift not found.', 404));
      }

      this.startedOrdersMap = {};

      prodShiftOrders.forEach(pso =>
      {
        if (pso.quantityDone > 0 || !pso.finishedAt)
        {
          this.startedOrdersMap[pso.orderId] = true;
        }
      });

      this.planId = moment.utc(app.formatDate(prodShift.date), 'YYYY-MM-DD').toDate();

      PlanSettings.aggregate([
        {$match: {_id: this.planId}},
        {$unwind: '$mrps'},
        {$unwind: '$mrps.lines'},
        {$match: {'mrps.lines._id': prodShift.prodLine}},
        {$project: {_id: 0, mrp: '$mrps._id', workerCount: '$mrps.lines.workerCount'}}
      ], this.parallel());

      Plan.aggregate([
        {$match: {_id: this.planId}},
        {$unwind: '$lines'},
        {$match: {'lines._id': prodShift.prodLine}},
        {$unwind: '$lines.orders'},
        {$project: {
          _id: '$lines.orders.orderNo',
          startAt: {$hour: '$lines.orders.startAt'},
          workerCount: '$lines.workerCount'
        }},
        {$match: {
          startAt: {
            $gte: prodShift.date.getHours(),
            $lt: prodShift.date.getHours() + 8
          }
        }}
      ], this.parallel());
    },
    function(err, settings, lineOrders)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find line orders: ${err.message}`, 500));
      }

      if (!lineOrders.length)
      {
        return this.skip(null, []);
      }

      this.lineOrdersList = lineOrders;
      this.lineOrdersMap = {};
      this.workerCountMap = {};

      lineOrders.forEach(lineOrder =>
      {
        this.lineOrdersMap[lineOrder._id] = lineOrder;
      });

      settings.forEach(settings =>
      {
        this.workerCountMap[settings.mrp] = settings.workerCount;
      });

      const orderIds = Object.keys(this.lineOrdersMap);

      Plan.aggregate([
        {$match: {_id: this.planId}},
        {$unwind: '$orders'},
        {$match: {'orders._id': {$in: orderIds}}},
        {$project: {_id: '$orders._id', operationNo: '$orders.operation.no'}}
      ], this.parallel());

      Order
        .find({_id: {$in: orderIds}}, {statusesSetAt: 0, documents: 0, bom: 0, changes: 0, importTs: 0, __v: 0})
        .lean()
        .exec(this.parallel());
    },
    function(err, planOrders, sapOrders)
    {
      if (err)
      {
        return this.skip(app.createError(`Failed to find orders: ${err.message}`, 500));
      }

      planOrders.forEach(planOrder =>
      {
        this.lineOrdersMap[planOrder._id].operationNo = planOrder.operationNo;
      });

      sapOrders.forEach(sapOrder =>
      {
        const operations = {};

        sapOrder.operations.forEach(op => operations[op.no] = op);

        sapOrder.operations = operations;
        sapOrder.no = sapOrder._id;

        delete sapOrder._id;

        this.lineOrdersMap[sapOrder.no].workerCount = this.workerCountMap[sapOrder.mrp] || 0;
        this.lineOrdersMap[sapOrder.no].sapOrder = sapOrder;
      });

      setImmediate(this.next(), null, this.lineOrdersList.map(o => ({
        order: o.sapOrder,
        operationNo: o.operationNo,
        workerCount: o.workerCount
      })).filter(o => !!o.order && !!o.operationNo && o.workerCount >= 0 && !this.startedOrdersMap[o.order.no]));
    },
    function(err, orderQueue)
    {
      if (err)
      {
        productionModule.error(`Failed to get order queue for [${prodShiftId}]: ${err.message}`);
      }

      done(null, orderQueue || []);
    }
  );
};
