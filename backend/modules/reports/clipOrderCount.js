// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');
var step = require('h5.step');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  importerId: 'orders/importer/orders',
  syncHour: 6
};

exports.start = function startClipOrderCountModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var Order = mongoose.model('Order');
  var MrpController = mongoose.model('MrpController');
  var ClipOrderCount = mongoose.model('ClipOrderCount');

  app.broker.subscribe('app.started', scheduleClipOrderCountCheck).setLimit(1);

  app.broker.subscribe('orders.synced', countAllOrders).setFilter(function(message)
  {
    return message.moduleName === module.config.importerId
      && new Date().getHours() === module.config.syncHour;
  });

  function yesterday()
  {
    return moment().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(1, 'days').toDate();
  }

  function formatDate(date)
  {
    return moment(date).format('YYYY-MM-DD');
  }

  function scheduleClipOrderCountCheck()
  {
    if (new Date().getHours() > module.config.syncHour)
    {
      checkClipOrderCount();
    }

    var nextCheckMoment = moment()
      .hours(module.config.syncHour + 1)
      .minutes(1)
      .seconds(0)
      .milliseconds(0)
      .add(1, 'days');

    setTimeout(scheduleClipOrderCountCheck, nextCheckMoment.diff(Date.now()));

    module.debug(
      "Scheduled the next CLIP order count check to be at [%s]",
      nextCheckMoment.format('YYYY-MM-DD HH:mm:ss')
    );
  }

  function checkClipOrderCount()
  {
    var startDate = yesterday();

    module.debug(
      "Checking the CLIP order count for [%s]...", formatDate(startDate)
    );

    ClipOrderCount.count({date: startDate}, function(err, count)
    {
      if (err)
      {
        return module.error(
          "Failed to count ClipOrderCount for [%s]: %s", formatDate(startDate), err.message
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

    module.debug("Preparing CLIP for [%s]...", formatDate(startDate));

    step(
      function()
      {
        MrpController.find({replacedBy: {$ne: null}}, {replacedBy: 1}).lean().exec(this.parallel());

        Order.aggregate(
          {$match: {startDate: startDate}},
          {$group: {_id: '$mrp', count: {$sum: 1}}},
          this.parallel()
        );
      },
      function(err, mrpControllers, results)
      {
        if (err)
        {
          return module.error("Failed to count all orders: %s", err.stack);
        }

        var replacedMrpMap = {};

        mrpControllers.forEach(function(mrpController)
        {
          replacedMrpMap[mrpController._id] = mrpController.replacedBy;
        });

        var mrpToCountMap = {};

        results.forEach(function(result)
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

  function countOrdersByStatuses(startDate, replacedMrpMap,mrpToCountMap)
  {
    Order.aggregate(
      {$match: {startDate: startDate}},
      {$project: {_id: 0, mrp: 1, statuses: 1}},
      {$unwind: '$statuses'},
      {$match: {statuses: {$in: ['CNF', 'DLV']}}},
      {$group: {
        _id: {status: '$statuses', mrp: '$mrp'},
        count: {$sum: 1}
      }},
      function(err, results)
      {
        if (err)
        {
          return module.error("Failed to count orders by statuses: %s", err.stack);
        }

        results.forEach(function(result)
        {
          var mrp = replacedMrpMap[result._id.mrp] || result._id.mrp;
          var status = result._id.status.toLowerCase();

          mrpToCountMap[mrp][status] = result.count;
        });

        createClipOrderCounts(startDate, mrpToCountMap);
      }
    );
  }

  function createClipOrderCounts(startDate, mrpToCountMap)
  {
    var models = [];

    Object.keys(mrpToCountMap).forEach(function(mrp)
    {
      var count = mrpToCountMap[mrp];

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
          "Failed to create %d ClipOrderCounts for [%s]: %s",
          models.length,
          formatDate(startDate),
          err.stack
        );
      }

      module.info("Created %d new ClipOrderCounts for [%s]", models.length, formatDate(startDate));

      app.broker.publish('clipOrderCount.created', {
        date: startDate,
        total: models.length
      });
    });
  }
};
