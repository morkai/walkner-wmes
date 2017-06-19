// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var moment = require('moment');
var step = require('h5.step');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  settingsId: 'settings'
};

exports.start = function startWarehouseShiftMetricsModule(app, module)
{
  var mongoose = app[module.config.mongooseId];

  if (!mongoose)
  {
    throw new Error("mongoose module is required!");
  }

  var FTE_UPDATE_DELAY = 30000;
  var COMPONENT_STORAGE_METRICS = [
    'inComp', 'coopComp', 'exStorage', 'fifo', 'staging', 'sm', 'paint', 'fixBin', 'compAbsence'
  ];
  var FINISHED_GOODS_STORAGE_METRICS = [
    'finGoodsIn', 'finGoodsOut', 'finGoodsAbsence'
  ];

  var WhShiftMetrics = mongoose.model('WhShiftMetrics');
  var WhTransferOrder = mongoose.model('WhTransferOrder');
  var FteLeaderEntry = mongoose.model('FteLeaderEntry');

  var timers = {};

  app.broker.subscribe('warehouse.transferOrders.synced', queueShiftMetricsCalc);
  app.broker.subscribe('warehouse.importQueue.shiftMetrics', calcShiftsMetrics);
  app.broker.subscribe('fte.leader.created', onFteLeaderEntryCreated);
  app.broker.subscribe('fte.leader.deleted', onFteLeaderEntryDeleted);
  app.broker.subscribe('fte.leader.updated.*', onFteLeaderEntryUpdated);

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

    steps.push(findSettingsStep);
    steps.push(prepareSettingsStep);

    _.forEach([6, 14, 22], function(h, i)
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

  function findSettingsStep()
  {
    /*jshint validthis:true*/

    var settingsModule = app[module.config.settingsId];
    var next = this.next();

    if (settingsModule)
    {
      settingsModule.findValues({_id: /^reports\.wh\./}, 'reports.wh.', next);
    }
    else
    {
      next(null, {});
    }
  }

  function prepareSettingsStep(err, settings)
  {
    /*jshint validthis:true*/

    if (err)
    {
      return this.skip(err);
    }

    this.settings = {
      componentStorage: {
        _id: settings['comp.id'] ? new mongoose.Types.ObjectId(settings['comp.id']) : null,
        tasks: {}
      },
      finishedGoodsStorage: {
        _id: settings['finGoods.id'] ? new mongoose.Types.ObjectId(settings['finGoods.id']) : null,
        tasks: {}
      }
    };

    _.forEach(COMPONENT_STORAGE_METRICS, (metric) =>
    {
      var prodTaskId = settings[metric + '.prodTask'] || null;

      if (prodTaskId !== null)
      {
        this.settings.componentStorage.tasks[prodTaskId] = metric;
      }
    });

    _.forEach(FINISHED_GOODS_STORAGE_METRICS, (metric) =>
    {
      var prodTaskId = settings[metric + '.prodTask'] || null;

      if (prodTaskId !== null)
      {
        this.settings.finishedGoodsStorage.tasks[prodTaskId] = metric;
      }
    });
  }

  function createCalcShiftMetricsStep(shiftNo, shiftMoment)
  {
    return function calcShiftMetricsStep()
    {
      calcShiftMetrics(this.settings, shiftNo, shiftMoment, this.next());
    };
  }

  function calcShiftMetrics(settings, shiftNo, shiftMoment, done)
  {
    var shiftDate = shiftMoment.toDate();

    module.debug("Calculating metrics for shift [%s, %d]...", app.formatDate(shiftDate), shiftNo);

    step(
      function findModelsStep()
      {
        var conditions = {
          date: shiftDate,
          subdivision: {
            $in: [
              settings.componentStorage._id,
              settings.finishedGoodsStorage._id
            ]
          }
        };
        var fields = {
          subdivision: 1,
          'tasks.id': 1,
          'tasks.childCount': 1,
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

        this.whShiftMetrics.resetFte();

        for (var i = 0, l = fteLeaderEntries.length; i < l; ++i)
        {
          var fteLeaderEntry = fteLeaderEntries[i];

          if (fteLeaderEntry.subdivision.equals(settings.componentStorage._id))
          {
            countStorageFte(this.whShiftMetrics, fteLeaderEntry.tasks, 'comp', settings.componentStorage.tasks);
          }
          else if (fteLeaderEntry.subdivision.equals(settings.finishedGoodsStorage._id))
          {
            countStorageFte(this.whShiftMetrics, fteLeaderEntry.tasks, 'finGoods', settings.finishedGoodsStorage.tasks);
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
            coopComp541: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$mvmtIm', 541]}
            ]}),
            coopComp344: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$dstType', 48]},
              {$eq: ['$mvmtIm', 344]}
            ]}),
            coopComp343: createCondSumOp({$and: [
              {$eq: ['$plant', 'PL04']},
              {$eq: ['$srcType', 48]},
              {$eq: ['$mvmtIm', 343]}
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
          this.whShiftMetrics.resetCounts();
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

  function countStorageFte(whShiftMetrics, tasks, subdivisionProperty, taskToMetric)
  {
    if (!Array.isArray(tasks))
    {
      return;
    }

    var tasksProperty = subdivisionProperty + 'Tasks';
    var totalFteProperty = subdivisionProperty + 'TotalFte';

    for (var i = 0, l = tasks.length; i < l; ++i)
    {
      var task = tasks[i];
      var metric = taskToMetric[task.id];
      var fteProperty = metric + 'Fte';

      if (!task.totals)
      {
        continue;
      }

      if (metric === undefined)
      {
        whShiftMetrics[tasksProperty][task.id] = task.totals.overall;
      }
      else
      {
        whShiftMetrics[fteProperty] = task.totals.overall;
      }

      if (!task.childCount)
      {
        whShiftMetrics[totalFteProperty] += task.totals.overall;
      }
    }
  }

  function onFteLeaderEntryCreated(message)
  {
    updateShiftFteMetrics(message.model._id);
  }

  function onFteLeaderEntryDeleted(message)
  {
    updateShiftFteMetrics(message.model._id, message.model);
  }

  function onFteLeaderEntryUpdated(message)
  {
    updateShiftFteMetrics(message._id);
  }

  function updateShiftFteMetrics(fteLeaderEntryId, deletedFteLeaderEntry)
  {
    if (timers[fteLeaderEntryId] !== undefined)
    {
      clearTimeout(timers[fteLeaderEntryId]);
    }

    timers[fteLeaderEntryId] = setTimeout(
      doUpdateShiftFteMetrics, FTE_UPDATE_DELAY, fteLeaderEntryId, deletedFteLeaderEntry
    );
  }

  function doUpdateShiftFteMetrics(fteLeaderEntryId, deletedFteLeaderEntry)
  {
    delete timers[fteLeaderEntryId];

    step(
      findSettingsStep,
      prepareSettingsStep,
      function findFteLeaderEntryStep()
      {
        if (deletedFteLeaderEntry)
        {
          return;
        }

        var fields = {
          subdivision: 1,
          date: 1,
          'tasks.id': 1,
          'tasks.childCount': 1,
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
          if (!deletedFteLeaderEntry)
          {
            return this.skip(new Error('FTE_ENTRY_NOT_FOUND'));
          }

          fteLeaderEntry = deletedFteLeaderEntry;
        }

        var subdivisionId = String(fteLeaderEntry.subdivision);

        this.isComponentStorage = subdivisionId === String(this.settings.componentStorage._id);
        this.isFinishedGoodsStorage = subdivisionId === String(this.settings.finishedGoodsStorage._id);

        if (!this.isComponentStorage && !this.isFinishedGoodsStorage)
        {
          return this.skip();
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
          return this.skip();
        }

        whShiftMetrics.resetFte(this.isComponentStorage, this.isFinishedGoodsStorage);

        var settings = this.settings;

        if (!deletedFteLeaderEntry)
        {
          if (this.isComponentStorage)
          {
            countStorageFte(whShiftMetrics, this.fteLeaderEntry.tasks, 'comp', settings.componentStorage.tasks);
          }
          else
          {
            countStorageFte(whShiftMetrics, this.fteLeaderEntry.tasks, 'finGoods', settings.finishedGoodsStorage.tasks);
          }
        }

        whShiftMetrics.save(this.next());
      },
      function finalizeStep(err, whShiftMetrics)
      {
        if (err)
        {
          return module.error(
            "Failed to update shift FTE metrics after updating FTE leader entry [%s]: %s",
            fteLeaderEntryId,
            err.message
          );
        }

        if (whShiftMetrics)
        {
          app.broker.publish('warehouse.shiftMetrics.updated', {date: this.fteLeaderEntry.date});
        }
      }
    );
  }
};
