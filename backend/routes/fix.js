// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const _ = require('lodash');
const step = require('h5.step');

module.exports = function startFixRoutes(app, express)
{
  const inProgress = {};

  function onlySuper(req, res, next)
  {
    const user = req.session.user;

    if (user && user.super)
    {
      return next();
    }

    return res.sendStatus(403);
  }

  express.get('/fix/prodShiftOrders/durations', onlySuper, fixProdShiftOrderDurations);
  express.get('/fix/prodShiftOrders/operation-times', onlySuper, fixProdShiftOrderOperationTimes);
  express.get('/fix/prodLogEntries/corroborated-before-created', onlySuper, fixProdLogEntriesCorroboratedBeforeCreated);
  express.get('/fix/prodLogEntries/corroborate-downtimes', onlySuper, corroborateDowntimeLogEntries);
  express.get('/fix/prodLogEntries/recreate', onlySuper, recreateProdData);
  express.get('/fix/hourlyPlans/recount-planned-quantities', onlySuper, recountPlannedQuantities);
  express.get('/fix/fteMasterEntries/recount-totals', onlySuper, recountFteMasterTotals);
  express.get('/fix/fteLeaderEntries/recount-totals', onlySuper, recountFteLeaderTotals);
  express.get('/fix/pressWorksheets/org-units', onlySuper, setPressWorksheetOrgUnits);

  function fixProdShiftOrderDurations(req, res, next)
  {
    if (inProgress.fixProdShiftOrderDurations)
    {
      return next(new Error('IN_PROGRESS'));
    }

    inProgress.fixProdShiftOrderDurations = true;

    res.setTimeout(30 * 60 * 1000);

    app.debug("[fix] Recounting ProdShiftOrders' durations...");

    app.mongoose.model('ProdShiftOrder')
      .find({finishedAt: {$ne: null}}, {startedAt: 1, finishedAt: 1})
      .exec(function(err, prodShiftOrders)
      {
        if (err)
        {
          inProgress.fixProdShiftOrderDurations = false;

          return next(err);
        }

        app.debug(`[fix] Found ${prodShiftOrders.length} ProdShiftOrders...`);

        recountNext(prodShiftOrders, 0);
      });

    function recountNext(prodShiftOrders, i)
    {
      if (i > 0 && i % 10000 === 0)
      {
        app.debug(`[fix] Recounted ${i} ProdShiftOrders... ${prodShiftOrders.length} remaining...`);
      }

      const prodShiftOrder = prodShiftOrders.shift();

      if (!prodShiftOrder)
      {
        inProgress.fixProdShiftOrderDurations = false;

        res.type('txt');
        res.send('ALL DONE!');

        return;
      }

      const next = recountNext.bind(null, prodShiftOrders, i + 1);

      app.production.getProdData(null, prodShiftOrder._id, function(err, cachedProdShiftOrder)
      {
        if (err)
        {
          app.warn(`[fix] ${err.message}`);
        }

        if (cachedProdShiftOrder)
        {
          cachedProdShiftOrder.recalcDurations(true, next);
        }
        else
        {
          prodShiftOrder.recalcDurations(true, next);
        }
      });
    }
  }

  function fixProdShiftOrderOperationTimes(req, res, next)
  {
    app.mongoose.model('ProdShiftOrder').find({}).exec(function(err, prodShiftOrders)
    {
      if (err)
      {
        return next(err);
      }

      const steps = [];

      _.forEach(prodShiftOrders, function(prodShiftOrder)
      {
        steps.push(function()
        {
          prodShiftOrder.save(this.next());
        });
      });

      steps.push(function()
      {
        res.type('txt');
        res.send('ALL DONE!');
      });

      step(steps);
    });
  }

  function corroborateDowntimeLogEntries(req, res, next)
  {
    const ProdLogEntry = app.mongoose.model('ProdLogEntry');
    const conditions = {
      $or: [
        {status: {$ne: 'undecided'}},
        {reason: 'A'}
      ],
      prodShift: {$ne: null},
      finishedAt: {$ne: null}
    };
    const fields = {
      status: 1,
      decisionComment: 1,
      corroborator: 1,
      corroboratedAt: 1,
      reason: 1,
      finishedAt: 1,
      date: 1,
      division: 1,
      subdivision: 1,
      mrpControllers: 1,
      prodFlow: 1,
      workCenter: 1,
      prodLine: 1,
      prodShift: 1,
      prodShiftOrder: 1
    };
    const buggedDowntimeDate = Date.parse('2013-12-01 06:00:00');

    app.mongoose.model('ProdDowntime').find(conditions, fields).lean().exec(function(err, prodDowntimes)
    {
      if (err)
      {
        return next(err);
      }

      step(
        function()
        {
          const step = this;

          _.forEach(prodDowntimes, function(prodDowntime)
          {
            if (prodDowntime.date < buggedDowntimeDate)
            {
              return;
            }

            if (prodDowntime.reason === 'A')
            {
              prodDowntime.status = 'confirmed';
              prodDowntime.decisionComment = '';
              prodDowntime.corroboratedAt = new Date(prodDowntime.finishedAt.getTime() + 1);
              prodDowntime.corroborator = {
                id: null,
                ip: '127.0.0.1',
                cname: 'LOCALHOST',
                label: 'System'
              };
            }

            const prodLogEntry = {
              _id: ProdLogEntry.generateId(prodDowntime.corroboratedAt, prodDowntime.prodShift),
              type: 'corroborateDowntime',
              data: {
                _id: prodDowntime._id,
                status: prodDowntime.status,
                corroborator: prodDowntime.corroborator,
                corroboratedAt: prodDowntime.corroboratedAt,
                decisionComment: prodDowntime.decisionComment
              },
              division: prodDowntime.division,
              subdivision: prodDowntime.subdivision,
              mrpControllers: prodDowntime.mrpControllers,
              prodFlow: prodDowntime.prodFlow,
              workCenter: prodDowntime.workCenter,
              prodLine: prodDowntime.prodLine,
              prodShift: prodDowntime.prodShift,
              prodShiftOrder: prodDowntime.prodShiftOrder,
              creator: prodDowntime.corroborator,
              createdAt: prodDowntime.corroboratedAt,
              savedAt: prodDowntime.corroboratedAt,
              todo: false
            };

            saveCorroborateDowntimeLogEntry(prodLogEntry, step.parallel());
          });
        },
        function()
        {
          res.type('txt');
          res.send('ALL DONE!');
        }
      );
    });

    function saveCorroborateDowntimeLogEntry(newProdLogEntry, done)
    {
      ProdLogEntry
        .findOne({type: 'corroborateDowntime', createdAt: newProdLogEntry.createdAt}, {_id: 1})
        .lean()
        .exec(function(err, existingProdLogEntry)
        {
          if (err)
          {
            return done(err);
          }

          if (existingProdLogEntry)
          {
            return done();
          }

          ProdLogEntry.collection.insert(newProdLogEntry, done);
        });
    }
  }

  function recreateProdData(req, res, next)
  {
    res.setTimeout(30 * 60 * 1000);

    app.production.recreate(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.type('txt');
      res.send('ALL DONE!');
    });
  }

  function fixProdLogEntriesCorroboratedBeforeCreated(req, res, next)
  {
    const ProdLogEntry = app.mongoose.model('ProdLogEntry');
    const prodDowntimeIds = [];
    const corroborateDowntimeMap = {};

    ProdLogEntry.find({type: 'corroborateDowntime'}).exec(function(err, corroborateDowntimeEntries)
    {
      if (err)
      {
        return next(err);
      }

      _.forEach(corroborateDowntimeEntries, function(corroborateDowntimeEntry)
      {
        prodDowntimeIds.push(corroborateDowntimeEntry.data._id);

        corroborateDowntimeMap[corroborateDowntimeEntry.data._id] = corroborateDowntimeEntry;
      });

      const conditions = {
        type: 'finishDowntime',
        'data._id': {$in: prodDowntimeIds}
      };
      const fields = {
        createdAt: 1,
        savedAt: 1,
        'data._id': 1
      };

      ProdLogEntry.find(conditions, fields).exec(function(err, finishDowntimeEntries)
      {
        if (err)
        {
          return next(err);
        }

        const updates = [];

        _.forEach(finishDowntimeEntries, function(finishDowntimeEntry)
        {
          const corroborateDowntimeEntry = corroborateDowntimeMap[finishDowntimeEntry.data._id];

          if (!corroborateDowntimeEntry)
          {
            return;
          }

          if (corroborateDowntimeEntry.savedAt <= finishDowntimeEntry.savedAt
            || corroborateDowntimeEntry.createdAt <= finishDowntimeEntry.createdAt)
          {
            corroborateDowntimeEntry.savedAt = new Date(finishDowntimeEntry.savedAt.getTime() + 1);
            corroborateDowntimeEntry.createdAt = new Date(finishDowntimeEntry.createdAt.getTime() + 1);
            corroborateDowntimeEntry.data.corroboratedAt = corroborateDowntimeEntry.savedAt;

            updates.push({
              _id: corroborateDowntimeEntry._id,
              $set: {
                savedAt: corroborateDowntimeEntry.savedAt,
                createdAt: corroborateDowntimeEntry.createdAt,
                'data.corroboratedAt': corroborateDowntimeEntry.data.corroboratedAt
              }
            });
          }
        });

        step(
          function()
          {
            for (let i = 0, l = updates.length; i < l; ++i)
            {
              ProdLogEntry.update({_id: updates[i]._id}, {$set: updates[i].$set}, this.group());
            }
          },
          function(err)
          {
            if (err)
            {
              return next(err);
            }

            res.type('txt');
            res.send('ALL DONE!');
          }
        );
      });
    });
  }

  function recountPlannedQuantities(req, res, next)
  {
    app.mongoose.model('HourlyPlan').find().sort({date: 1, division: 1}).exec(function(err, hourlyPlans)
    {
      if (err)
      {
        return next(err);
      }

      step(
        function()
        {
          for (let i = 0, l = hourlyPlans.length; i < l; ++i)
          {
            hourlyPlans[i].recountPlannedQuantities(this.parallel());
          }
        },
        function(err)
        {
          if (err)
          {
            return next(err);
          }

          res.type('txt');
          res.send('ALL DONE!');
        }
      );
    });
  }

  function recountFteMasterTotals(req, res, next)
  {
    if (inProgress.recountFteTotals)
    {
      return next(app.createError('IN_PROGRESS', 400));
    }

    inProgress.recountFteTotals = true;

    const startedAt = Date.now();

    app.debug('[fix] Recounting FTE Master totals...');

    recountFteTotals('FteMasterEntry', moment('2013-12-01T05:00:00.000Z'), function(err)
    {
      inProgress.recountFteTotals = false;

      if (err)
      {
        return next(err);
      }

      res.type('txt');
      res.send('ALL DONE!');

      app.debug(`[fix] Finished recounting FTE Master totals in ${(Date.now() - startedAt) / 1000}s`);
    });
  }

  function recountFteLeaderTotals(req, res, next)
  {
    if (inProgress.recountFteTotals)
    {
      return next(app.createError('IN_PROGRESS', 400));
    }

    inProgress.recountFteTotals = true;

    const startedAt = Date.now();

    app.debug('[fix] Recounting FTE Leader totals...');

    recountFteTotals('FteLeaderEntry', moment('2013-12-01T05:00:00.000Z'), function(err)
    {
      inProgress.recountFteTotals = false;

      if (err)
      {
        return next(err);
      }

      res.type('txt');
      res.send('ALL DONE!');

      app.debug(`[fix] Finished recounting FTE Leader totals in ${(Date.now() - startedAt) / 1000}s`);
    });
  }

  function recountFteTotals(modelName, fromMoment, done)
  {
    const conditions = {
      date: {
        $gte: new Date(fromMoment.valueOf()),
        $lt: new Date(fromMoment.add(7, 'days').valueOf())
      }
    };

    if (conditions.date.$gte > Date.now())
    {
      return done();
    }

    app.mongoose.model(modelName).find(conditions).exec(function(err, allFteEntries)
    {
      if (err)
      {
        return done(err);
      }

      calcNext();

      function calcNext()
      {
        const fteEntries = allFteEntries.splice(0, 5);

        if (fteEntries.length === 0)
        {
          return setTimeout(recountFteTotals.bind(null, modelName, fromMoment, done), 30);
        }

        step(
          function()
          {
            for (let i = 0, l = fteEntries.length; i < l; ++i)
            {
              fteEntries[i].calcTotals();
              fteEntries[i].save(this.group());
            }
          },
          function(err)
          {
            if (err)
            {
              return done(err);
            }

            setTimeout(calcNext, 30);
          }
        );
      }
    });
  }

  function setPressWorksheetOrgUnits(req, res, next)
  {
    res.setTimeout(30 * 60 * 1000);

    const PressWorksheet = app.mongoose.model('PressWorksheet');
    const stream = PressWorksheet.find({division: null}, {'orders.prodLine': 1}).cursor();
    let todo = 0;
    let ended = false;

    stream.on('error', next);

    stream.on('end', function()
    {
      ended = true;

      if (todo === 0)
      {
        res.end();
      }
    });

    stream.on('data', function(pressWorksheet)
    {
      ++todo;

      const divisions = {};
      const prodLines = {};
      const $set = {};

      _.forEach(pressWorksheet.orders, function(order, i)
      {
        const division = app.orgUnits.getDivisionFor('prodLine', order.prodLine);

        prodLines[order.prodLine] = true;

        if (division)
        {
          divisions[division._id] = true;
        }

        $set[`orders.${i}.division`] = division ? division._id : null;
      });

      $set.divisions = Object.keys(divisions);
      $set.prodLines = Object.keys(prodLines);

      PressWorksheet.collection.update({_id: pressWorksheet._id}, {$set: $set}, function()
      {
        --todo;

        if (ended && todo === 0)
        {
          res.end();
        }
      });
    });
  }
};
