// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  importerId: 'orders/importer/orders',
  syncHour: 6
};

exports.start = function startClipOrderCountModule(app, module)
{
  const mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error('mongoose module is required!');
  }

  const Order = mongoose.model('Order');
  const MrpController = mongoose.model('MrpController');
  const ClipOrderCount = mongoose.model('ClipOrderCount');

  app.broker.subscribe('app.started', scheduleClipOrderCountCheck).setLimit(1);

  app.broker.subscribe('orders.synced')
    .setFilter(function(message)
    {
      return message.moduleName === module.config.importerId
        && new Date().getHours() === module.config.syncHour;
    })
    .on('message', function()
    {
      countAllOrders();
    });

  function yesterday()
  {
    return moment().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(1, 'days').toDate();
  }

  function scheduleClipOrderCountCheck()
  {
    const now = new Date();

    if (now.getHours() > module.config.syncHour)
    {
      checkClipOrderCount();
    }

    const nowTime = now.getTime();
    const nextCheckMoment = moment(now)
      .hours(module.config.syncHour + 1)
      .minutes(1)
      .seconds(0)
      .milliseconds(0)
      .add(1, 'days');

    setTimeout(scheduleClipOrderCountCheck, nextCheckMoment.diff(nowTime));

    module.debug(
      'Scheduled the next CLIP order count check to be at [%s]',
      app.formatDateTime(nextCheckMoment.toDate())
    );
  }

  function checkClipOrderCount()
  {
    const startDate = yesterday();

    module.debug(
      'Checking the CLIP order count for [%s]...', app.formatDate(startDate)
    );

    ClipOrderCount.count({date: startDate}, function(err, count)
    {
      if (err)
      {
        return module.error(
          'Failed to count ClipOrderCount for [%s]: %s', app.formatDate(startDate), err.message
        );
      }

      if (count === 0)
      {
        countAllOrders(startDate);
      }
    });
  }

  function countAllOrders(startDate)
  {
    if (!startDate)
    {
      startDate = yesterday();
    }

    module.debug('Preparing CLIP for [%s]...', app.formatDate(startDate));

    step(
      function()
      {
        MrpController.find({replacedBy: {$ne: null}}, {replacedBy: 1}).lean().exec(this.parallel());

        Order.aggregate(
          [
            {$match: {scheduledStartDate: startDate}},
            {$group: {_id: '$mrp', count: {$sum: 1}}}
          ],
          this.parallel()
        );
      },
      function(err, mrpControllers, results)
      {
        if (err)
        {
          return module.error('Failed to count all orders: %s', err.stack);
        }

        const replacedMrpMap = {};

        _.forEach(mrpControllers, function(mrpController)
        {
          replacedMrpMap[mrpController._id] = mrpController.replacedBy;
        });

        const mrpToCountMap = {};

        _.forEach(results, function(result)
        {
          mrpToCountMap[replacedMrpMap[result._id] || result._id] = {
            all: result.count,
            cnf: 0,
            dlv: 0
          };
        });

        countOrdersByStatuses(startDate, replacedMrpMap, mrpToCountMap);
      }
    );
  }

  function countOrdersByStatuses(startDate, replacedMrpMap, mrpToCountMap)
  {
    Order.aggregate(
      [
        {$match: {scheduledStartDate: startDate}},
        {$project: {_id: 0, mrp: 1, statuses: 1}},
        {$unwind: '$statuses'},
        {$match: {statuses: {$in: ['CNF', 'DLV']}}},
        {$group: {
          _id: {status: '$statuses', mrp: '$mrp'},
          count: {$sum: 1}
        }}
      ],
      function(err, results)
      {
        if (err)
        {
          return module.error('Failed to count orders by statuses: %s', err.stack);
        }

        _.forEach(results, function(result)
        {
          const mrp = replacedMrpMap[result._id.mrp] || result._id.mrp;
          const status = result._id.status.toLowerCase();

          mrpToCountMap[mrp][status] = result.count;
        });

        createClipOrderCounts(startDate, mrpToCountMap);
      }
    );
  }

  function createClipOrderCounts(startDate, mrpToCountMap)
  {
    const models = [];

    _.forEach(mrpToCountMap, function(count, mrp)
    {
      models.push({
        date: startDate,
        tzOffsetMs: startDate.getTimezoneOffset() * 60 * 1000 * -1,
        mrp: mrp,
        all: count.all,
        cnf: count.cnf,
        dlv: count.dlv
      });
    });

    ClipOrderCount.create(models, function(err)
    {
      if (err)
      {
        return module.error(
          'Failed to create %d ClipOrderCounts for [%s]: %s',
          models.length,
          app.formatDate(startDate),
          err.stack
        );
      }

      module.info('Created %d new ClipOrderCounts for [%s]', models.length, app.formatDate(startDate));

      app.broker.publish('clipOrderCount.created', {
        date: startDate,
        total: models.length
      });
    });
  }
};
