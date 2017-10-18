// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const resolveProductName = require('../../util/resolveProductName');
const resolveBestOperation = require('../../util/resolveBestOperation');

module.exports = function browseLateOrdersRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');

  step(
    function()
    {
      PlanSettings.findById(req.params.id).exec(this.next());
    },
    function(err, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!settings)
      {
        return this.skip(null, []);
      }

      const planTime = moment(req.params.id, 'YYYY-MM-DD').valueOf();
      const nowTime = Date.now();
      const toMoment = moment(Math.min(planTime, nowTime)).startOf('day');
      const nearEndMoment = toMoment.clone().startOf('day').hours(5);

      if (nearEndMoment.diff(nowTime) > 0)
      {
        toMoment.subtract(1, 'days');
      }

      this.useRemainingQuantity = settings.useRemainingQuantity;

      const conditions = {
        scheduledStartDate: {
          $lt: toMoment.toDate(),
          $gte: toMoment.subtract(3, 'days').toDate()
        },
        mrp: {$in: settings.mrps.map(mrp => mrp._id)},
        statuses: {
          $all: settings.requiredStatuses,
          $nin: settings.ignoredStatuses
        }
      };
      const fields = {
        mrp: 1,
        nc12: 1,
        name: 1,
        description: 1,
        qty: 1,
        'qtyDone.total': 1,
        statuses: 1,
        delayReason: 1,
        scheduledStartDate: 1,
        operations: 1
      };

      Order.find(conditions, fields).sort({scheduledStartDate: 1}).lean().exec(this.next());
    },
    function(err, sapOrders)
    {
      if (err)
      {
        return this.skip(err);
      }

      const lateOrders = sapOrders
        .filter(o => !o.qtyDone || o.qtyDone.total < o.qty)
        .map(o => {
          const operation = _.pick(resolveBestOperation(o.operations), Plan.OPERATION_PROPERTIES);
          const quantityTodo = o.qty;
          const quantityDone = o.qtyDone && o.qtyDone.total || 0;
          const quantityRemaining = this.useRemainingQuantity ? Math.max(0, quantityTodo - quantityDone) : quantityTodo;
          const manHours = operation
            ? ((operation.laborTime / 100 * quantityRemaining) + operation.laborSetupTime)
            : 0;

          return {
            _id: o._id,
            date: moment.utc(moment(o.scheduledStartDate).format('YYYY-MM-DD'), 'YYYY-MM-DD').toISOString(),
            mrp: o.mrp,
            nc12: o.nc12,
            name: resolveProductName(o),
            quantityTodo,
            quantityDone,
            manHours: Math.round(manHours * 1000) / 1000,
            statuses: o.statuses,
            delayReason: o.delayReason,
            operation
          };
        });

      setImmediate(this.next(), null, lateOrders);
    },
    function(err, lateOrders)
    {
      if (err)
      {
        return next(err);
      }

      res.json({
        totalCount: lateOrders.length,
        collection: lateOrders
      });
    }
  );
};
