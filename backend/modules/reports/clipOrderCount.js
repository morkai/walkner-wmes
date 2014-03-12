'use strict';

var moment = require('moment');

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
  var ClipOrderCount = mongoose.model('ClipOrderCount');

  app.broker.subscribe('orders.synced')
    .setFilter(function(message)
    {
      return message.moduleName === module.config.importerId
        && new Date().getHours() === module.config.syncHour;
    })
    .on('message', countAllOrders);

  function countAllOrders()
  {
    var startDate = moment()
      .hours(0).minutes(0).seconds(0).milliseconds(0).subtract('days', 1).toDate();

    Order.aggregate(
      {$match: {startDate: startDate}},
      {$group: {_id: '$mrp', count: {$sum: 1}}},
      function(err, results)
      {
        if (err)
        {
          return module.error("Failed to count all orders: %s", err.stack);
        }

        var mrpToCountMap = {};

        results.forEach(function(result)
        {
          mrpToCountMap[result._id] = {
            all: result.count,
            cnf: 0,
            dlv: 0
          };
        });

        countOrdersByStatuses(startDate, mrpToCountMap);
      }
    );
  }

  function countOrdersByStatuses(startDate, mrpToCountMap)
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
          mrpToCountMap[result._id.mrp][result._id.status.toLowerCase()] = result.count;
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
          "Failed to create %d ClipOrderCounts: %s", models.length, err.stack
        );
      }

      module.info("Created %d new ClipOrderCounts", models.length);
    });
  }
};
