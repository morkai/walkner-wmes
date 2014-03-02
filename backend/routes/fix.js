'use strict';

var step = require('h5.step');

module.exports = function startFixRoutes(app, express)
{
  function onlySuper(req, res, next)
  {
    var user = req.session.user;

    if (user && user.super)
    {
      return next();
    }

    return res.send(403);
  }

  express.get('/fix/prodShiftOrderDurations', onlySuper, fixProdShiftOrderDurations);
  express.get('/fix/corroborateDowntimeLogEntries', onlySuper, corroborateDowntimeLogEntries);
  express.get('/fix/fillOrgUnits', onlySuper, fillOrgUnits);
  express.get('/fix/recreateProdData', onlySuper, recreateProdData);

  function fixProdShiftOrderDurations(req, res, next)
  {
    app.mongoose.model('ProdShiftOrder')
      .find({finishedAt: {$ne: null}}, {startedAt: 1, finishedAt: 1})
      .exec(function(err, prodShiftOrders)
      {
        if (err)
        {
          return next(err);
        }

        var steps = [];

        prodShiftOrders.forEach(function(prodShiftOrder)
        {
          steps.push(function()
          {
            var next = this.next();

            app.production.getProdData(null, prodShiftOrder._id, function(err, cachedProdShiftOrder)
            {
              if (cachedProdShiftOrder)
              {
                cachedProdShiftOrder.recalcDurations(true, next);
              }
              else
              {
                prodShiftOrder.recalcDurations(true, next);
              }
            });
          });
        });

        steps.push(function()
        {
          res.type('txt');
          res.send("ALL DONE!");
        });

        step(steps);
      });
  }

  function corroborateDowntimeLogEntries(req, res, next)
  {
    var ProdLogEntry = app.mongoose.model('ProdLogEntry');
    var conditions = {
      $or: [
        {status: {$ne: 'undecided'}},
        {reason: 'A'}
      ],
      prodShift: {$ne: null},
      finishedAt: {$ne: null}
    };
    var fields = {
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
    var buggedDowntimeDate = Date.parse('2013-12-01 06:00:00');

    app.mongoose.model('ProdDowntime')
      .find(conditions, fields)
      .lean()
      .exec(function(err, prodDowntimes)
      {
        if (err)
        {
          return next(err);
        }

        step(
          function()
          {
            var step = this;

            prodDowntimes.forEach(function(prodDowntime)
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

              var prodLogEntry = {
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
            res.send("ALL DONE!");
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
    app.production.recreate(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.type('txt');
      res.send("ALL DONE!");
    });
  }

  function fillOrgUnits(req, res, next)
  {
    var ProdLogEntry = app.mongoose.model('ProdLogEntry');
    var conditions = {
      $or: [
        {division: null},
        {type: 'changeShift', 'data.startedProdShift.division': null},
        {type: {$in: ['changeOrder', 'startDowntime']}, 'data.division': null}
      ]
    };

    ProdLogEntry
      .find(conditions)
      .lean()
      .exec(function(err, prodLogEntries)
      {
        if (err)
        {
          return next(err);
        }

        step(
          function()
          {
            var step = this;

            prodLogEntries.forEach(function(prodLogEntry)
            {
              var prodLineId = prodLogEntry.prodLine;

              applyProdLineOrgUnits(prodLogEntry, prodLineId);

              if (prodLogEntry.prodLine === null)
              {
                return ProdLogEntry.remove({_id: prodLogEntry._id}, step.parallel());
              }

              var data = prodLogEntry.type === 'changeShift'
                ? prodLogEntry.data.startedProdShift
                : prodLogEntry.data;

              data.division = prodLogEntry.division;
              data.subdivision = prodLogEntry.subdivision;
              data.mrpControllers = prodLogEntry.mrpControllers;
              data.prodFlow = prodLogEntry.prodFlow;
              data.workCenter = prodLogEntry.workCenter;
              data.prodLine = prodLogEntry.prodLine;

              ProdLogEntry.collection.update(
                {_id: prodLogEntry._id}, prodLogEntry, step.parallel()
              );
            });
          },
          function()
          {
            res.type('txt');
            res.send("ALL DONE!");
          }
        );
      });
  }

  function applyProdLineOrgUnits(orgUnits, prodLineId)
  {
    var prodLine = app.prodLines.modelsById[prodLineId];

    orgUnits.division = null;
    orgUnits.subdivision = null;
    orgUnits.mrpControllers = null;
    orgUnits.prodFlow = null;
    orgUnits.workCenter = null;
    orgUnits.prodLine = null;

    if (!prodLine)
    {
      return;
    }

    orgUnits.prodLine = prodLine.get('_id');

    var workCenter = app.workCenters.modelsById[prodLine.get('workCenter')];

    if (!workCenter)
    {
      return;
    }

    orgUnits.workCenter = workCenter.get('_id');

    var prodFlow = app.prodFlows.modelsById[workCenter.get('prodFlow')];

    if (!prodFlow)
    {
      return;
    }

    orgUnits.prodFlow = prodFlow.get('_id');

    var mrpController = prodFlow.get('mrpController');

    if (!Array.isArray(mrpController) || !mrpController.length)
    {
      return;
    }

    orgUnits.mrpControllers = mrpController;

    mrpController = app.mrpControllers.modelsById[mrpController[0]];

    if (!mrpController)
    {
      return;
    }

    var subdivision = app.subdivisions.modelsById[mrpController.get('subdivision')];

    if (!subdivision)
    {
      return;
    }

    orgUnits.subdivision = subdivision.get('_id');

    var division = app.divisions.modelsById[subdivision.get('division')];

    if (!division)
    {
      return;
    }

    orgUnits.division = division.get('_id');
  }
};
