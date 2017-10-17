// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const step = require('h5.step');
const resolveProductName = require('../../util/resolveProductName');

module.exports = function browseLateOrdersRoute(app, module, req, res, next)
{
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
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
        scheduledStartDate: 1
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
        .map(o => ({
          _id: o._id,
          date: moment.utc(moment(o.scheduledStartDate).format('YYYY-MM-DD'), 'YYYY-MM-DD').toISOString(),
          mrp: o.mrp,
          nc12: o.nc12,
          name: resolveProductName(o),
          quantityTodo: o.qty,
          quantityDone: o.qtyDone && o.qtyDone.total || 0,
          statuses: o.statuses,
          delayReason: o.delayReason
        }));

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
