// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var moment = require('moment');
var step = require('h5.step');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose'
};

exports.start = function startWarehouseImportQueueModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var FTE_UPDATE_DELAY = 30000;
  var COMPONENT_STORAGE_ID = new mongoose.Types.ObjectId('529f2629cd8eea982400000c');
  var FINISHED_GOODS_STORAGE_ID = new mongoose.Types.ObjectId('529f263ccd8eea982400000e');
  var COMPONENT_STORAGE_TASKS = {
    '54889cf90e63afb0d415bf1a': 'inComp',
    '54889d0f0e63afb0d415bf1c': 'coopComp',
    '54889d3c0e63afb0d415bf1e': 'exStorage',
    '52a96335486d8e600b000045': 'fifo',
    '5488d7ef0e63afb0d415bf31': 'staging',
    '5488d81a0e63afb0d415bf33': 'sm',
    '53f48d2dda670df4041e24ac': 'paint',
    '52a986b2486d8e600b00008a': 'fixBin'
  };
  var FINISHED_GOODS_STORAGE_TASKS = {
    '52a964db486d8e600b00004e': 'finGoodsInFte',
    '52a96516486d8e600b000052': 'finGoodsOutFte'
  };

  var WhShiftMetrics = mongoose.model('WhShiftMetrics');
  var WhTransferOrder = mongoose.model('WhTransferOrder');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var timers = {};

  app.broker.subscribe('warehouse.transferOrders.synced', queueShiftMetricsCalc);
  app.broker.subscribe('warehouse.importQueue.shiftMetrics', calcShiftsMetrics);
  app.broker.subscribe('fte.leader.updated.*', updateShiftFteMetrics);

  function queueShiftMetricsCalc(message)
  {
    app.broker.publish('warehouse.importQueue.push', {
      timestamp: message.timestamp,
      type: 'shiftMetrics',
      data: {
        date: moment(message.timestamp).subtract(1, 'days').hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
      }
    });
  }

  function calcShiftsMetrics(message)
  {
    var t = Date.now();
    var steps = [];

    [6, 14, 22].forEach(function(h, i)
    {
      steps.push(createCalcShiftMetricsStep(i + 1, moment(message.date.getTime()).hours(h)));
    });

    steps.push(function finalizeShiftMetricsStep(err)
    {
      var duration = Date.now() - t;

      if (err)
      {
        module.error("Failed to calculate shift metrics for %s in %d ms: %s", message.date, duration, err.message);

        app.broker.publish('warehouse.shiftMetrics.syncFailed', {
          date: message.date,
          error: err.message
        });
      }
      else
      {
        module.info("Finished calculating shift metrics for %s in %d ms.", message.date, duration);

        app.broker.publish('warehouse.shiftMetrics.synced', {
          date: message.date
        });
      }
    });

    step(steps);
  }

  function createCalcShiftMetricsStep(shiftNo, shiftMoment)
  {
    return function calcShiftMetricsStep()
    {
      calcShiftMetrics(shiftNo, shiftMoment, this.next());
    };
  }

  function calcShiftMetrics(shiftNo, shiftMoment, done)
  {
    module.debug("Calculating metrics for shift [%s, %d]...", shiftMoment.format('YYYY-MM-DD'), shiftNo);

    var shiftDate = shiftMoment.toDate();

    step(
      function findModelsStep()
      {
        var conditions = {
          date: shiftDate,
          subdivision: {
            $in: [
              COMPONENT_STORAGE_ID,
              FINISHED_GOODS_STORAGE_ID
            ]
          }
        };
        var fields = {
          subdivision: 1,
          'tasks.id': 1,
          'tasks.totals.overall': 1
        };

        FteLeaderEntry.find(conditions, fields).lean().exec(this.parallel());

        WhShiftMetrics.findById(shiftDate).exec(this.parallel());
      },
      function handleFindModelsResultStep(err, fteLeaderEntries, shiftMetrics)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.whShiftMetrics = shiftMetrics || new WhShiftMetrics({
          _id: shiftDate,
          tzOffsetMs: shiftDate.getTimezoneOffset() * 60 * 1000 * -1,
          compTasks: {},
          finGoodsTasks: {}
        });

        for (var i = 0, l = fteLeaderEntries.length; i < l; ++i)
        {
          var fteLeaderEntry = fteLeaderEntries[i];

          if (fteLeaderEntry.subdivision.equals(COMPONENT_STORAGE_ID))
          {
            countStorageFte(
              this.whShiftMetrics, fteLeaderEntry.tasks, 'compTasks', COMPONENT_STORAGE_TASKS, false
            );
          }
          else if (fteLeaderEntry.subdivision.equals(FINISHED_GOODS_STORAGE_ID))
          {
            countStorageFte(
              this.whShiftMetrics, fteLeaderEntry.tasks, 'finGoodsTasks', FINISHED_GOODS_STORAGE_TASKS, false
            );
          }
        }

        setImmediate(this.next());
      },
      function aggregateTransferOrderCountsStep()
      {
        WhTransferOrder.aggregate(
          {$match: {shiftDate: shiftDate}},
          {$group: {
            _id: null,
            inComp: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$mvmtWm', 101]}
            ]}),
            coopComp: createCondSumOp({$or: [
              {$and: [
                {$eq: ['$plant', 'PL04']},
                {$eq: ['$mvmtIm', 541]}
              ]},
              {$and: [
                {$eq: ['$plant', 'PL04']},
                {$eq: ['$dstType', 48]},
                {$eq: ['$mvmtIm', 344]}
              ]},
              {$and: [
                {$eq: ['$plant', 'PL04']},
                {$eq: ['$srcType', 48]},
                {$eq: ['$mvmtIm', 343]}
              ]}
            ]}),
            exStorageOut: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$dstType', 25]},
              {$eq: ['$mvmtWm', 989]}
            ]}),
            exStorageIn: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$srcType', 25]},
              {$eq: ['$mvmtWm', 989]}
            ]}),
            fifo: createCondSumOp({$and: [
              {$eq: ['$dstType', 100]},
              {$eq: ['$mvmtWm', 319]},
              {$eq: ['$s', 1]}
            ]}),
            staging: createCondSumOp({$and: [
              {$eq: ['$dstType', 100]},
              {$eq: ['$mvmtWm', 319]},
              {$eq: ['$s', 3]}
            ]}),
            paint: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$dstType', 100]},
              {$eq: ['$dstBin', 'P_SMI_PNTS']}
            ]}),
            fixBin: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$dstType', 40]},
              {$eq: ['$mvmtWm', 989]}
            ]}),
            finGoodsIn: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL02']},
              {$eq: ['$srcType', 150]}
            ]}),
            finGoodsOut: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL02']},
              {$eq: ['$dstType', 916]},
              {$eq: ['$mvmtIm', 601]}
            ]})
          }},
          this.next()
        );
      },
      function calcMetricsStep(err, results)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (results.length === 0)
        {
          this.whShiftMetrics.set({
            inCompCount: 0,
            coopCompCount: 0,
            exStorageOutCount: 0,
            exStorageInCount: 0,
            fifoCount: 0,
            stagingCount: 0,
            smCount: 0,
            paintCount: 0,
            fixBinCount: 0,
            finGoodsInCount: 0,
            finGoodsOutCount: 0
          });
        }

        var counts = results.length ? results[0] : {};
        var metrics = Object.keys(counts);

        for (var i = 0, l = metrics.length; i < l; ++i)
        {
          var metric = metrics[i];
          var count = counts[metric];

          if (count === null)
          {
            continue;
          }

          this.whShiftMetrics[metric + 'Count'] = count;
        }

        this.whShiftMetrics.save(this.next());
      },
      done
    );
  }

  function createCondSumOp(cond)
  {
    return {$sum: {$cond: {if: cond, then: 1, else: 0}}};
  }

  function countStorageFte(whShiftMetrics, tasks, tasksProperty, taskToMetric)
  {
    for (var i = 0, l = tasks.length; i < l; ++i)
    {
      var task = tasks[i];
      var metric = taskToMetric[task.id];
      var fteProperty = metric + 'Fte';

      if (fteProperty === undefined)
      {
        whShiftMetrics[tasksProperty][task.id] = task.totals.overall;
      }
      else
      {
        whShiftMetrics[fteProperty] = task.totals.overall;
      }
    }
  }

  function updateShiftFteMetrics(message)
  {
    if (timers[message._id] !== undefined)
    {
      clearTimeout(timers[message._id]);
    }

    timers[message._id] = setTimeout(doUpdateShiftFteMetrics, FTE_UPDATE_DELAY, message._id);
  }

  function doUpdateShiftFteMetrics(fteLeaderEntryId)
  {
    step(
      function findFteLeaderEntryStep()
      {
        var fields = {
          subdivision: 1,
          date: 1,
          'tasks.id': 1,
          'tasks.totals.overall': 1
        };

        FteLeaderEntry.findById(fteLeaderEntryId, fields).lean().exec(this.next());
      },
      function findShiftMetricsStep(err, fteLeaderEntry)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!fteLeaderEntry)
        {
          return this.skip(new Error('FTE_ENTRY_NOT_FOUND'));
        }

        if (!fteLeaderEntry.subdivision.equals(COMPONENT_STORAGE_ID)
          && !fteLeaderEntry.subdivision.equals(FINISHED_GOODS_STORAGE_ID))
        {
          return this.skip(new Error('INVALID_STORAGE_TYPE'));
        }

        this.fteLeaderEntry = fteLeaderEntry;

        WhShiftMetrics.findById(fteLeaderEntry.date).exec(this.next());
      },
      function updateShiftFteMetricsStep(err, whShiftMetrics)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!whShiftMetrics)
        {
          return this.skip(new Error('WH_SHIFT_METRICS_NOT_FOUND'));
        }

        if (this.fteLeaderEntry.subdivision.equals(COMPONENT_STORAGE_ID))
        {
          countStorageFte(whShiftMetrics, this.fteLeaderEntry.tasks, 'compTasks', COMPONENT_STORAGE_TASKS);
        }
        else
        {
          countStorageFte(whShiftMetrics, this.fteLeaderEntry.tasks, 'finGoodsTasks', FINISHED_GOODS_STORAGE_TASKS);
        }

        whShiftMetrics.save(this);
      },
      function finalizeStep(err)
      {
        if (err)
        {
          module.error(
            "Failed to update shift FTE metrics after updating FTE leader entry [%s]: %s",
            fteLeaderEntryId,
            err.message
          );
        }
      }
    );
  }
};
