/*jshint maxlen:999*/

'use strict';

var lodash = require('lodash');
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

  express.get('/fix/prodShiftOrders/durations', onlySuper, fixProdShiftOrderDurations);
  express.get('/fix/prodLogEntries/corroborated-before-created', onlySuper, fixProdLogEntriesCorroboratedBeforeCreated);
  express.get('/fix/prodLogEntries/corroborate-downtimes', onlySuper, corroborateDowntimeLogEntries);
  express.get('/fix/prodLogEntries/recreate', onlySuper, recreateProdData);
  express.get('/fix/hourlyPlans/recount-planned-quantities', onlySuper, recountPlannedQuantities);
  express.get('/fix/duplicate-users', fixDuplicateUsers);

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
    res.setTimeout(30 * 60 * 1000);

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

  function fixProdLogEntriesCorroboratedBeforeCreated(req, res, next)
  {
    var ProdLogEntry = app.mongoose.model('ProdLogEntry');
    var prodDowntimeIds = [];
    var corroborateDowntimeMap = {};

    ProdLogEntry.find({type: 'corroborateDowntime'}).exec(function(err, corroborateDowntimeEntries)
    {
      if (err)
      {
        return next(err);
      }

      corroborateDowntimeEntries.forEach(function(corroborateDowntimeEntry)
      {
        prodDowntimeIds.push(corroborateDowntimeEntry.data._id);

        corroborateDowntimeMap[corroborateDowntimeEntry.data._id] = corroborateDowntimeEntry;
      });

      ProdLogEntry.find({type: 'finishDowntime', 'data._id': {$in: prodDowntimeIds}}, {createdAt: 1, savedAt: 1, 'data._id': 1}).exec(function(err, finishDowntimeEntries)
      {
        if (err)
        {
          return next(err);
        }

        var updates = [];

        finishDowntimeEntries.forEach(function(finishDowntimeEntry)
        {
          var corroborateDowntimeEntry = corroborateDowntimeMap[finishDowntimeEntry.data._id];

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
            for (var i = 0, l = updates.length; i < l; ++i)
            {
              ProdLogEntry.update({_id: updates[i]._id}, {$set: updates[i].$set}, this.parallel());
            }
          },
          function(err)
          {
            if (err)
            {
              return next(err);
            }

            res.type('txt');
            res.send("ALL DONE!");
          }
        );
      });
    });
  }

  function recountPlannedQuantities(req, res, next)
  {
    app.mongoose.model('HourlyPlan')
      .find()
      .sort({date: 1, division: 1})
      .exec(function(err, hourlyPlans)
      {
        if (err)
        {
          return next(err);
        }

        step(
          function()
          {
            for (var i = 0, l = hourlyPlans.length; i < l; ++i)
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
            res.send("ALL DONE!");
          }
        );
      });
  }

  function fixDuplicateUsers(req, res, next)
  {
    step(
      function()
      {
        app.mongoose.model('User').aggregate(
          {
            $group: {
              _id: '$personellId',
              count: {$sum: 1},
              users: {
                $addToSet: {
                  _id: '$_id',
                  lastName: '$lastName',
                  firstName: '$firstName',
                  kdId: '$kdId'
                }
              }
            }
          },
          {$match: {count: {$ne: 1}}},
          this.next()
        );
      },
      function(err, results)
      {
        if (err)
        {
          return next(err);
        }

        var userStringIds = [];
        var users = {};

        results.forEach(function(result)
        {
          result.users.forEach(function(user)
          {
            user.personellId = result._id;
            user.pressWorksheets = [];
            user.prodShifts = [];

            users[user._id] = user;

            userStringIds.push(user._id.toString());
          });
        });

        app.mongoose.model('PressWorksheet').find({
          $or: [
            {master: {$in: userStringIds}},
            {operator: {$in: userStringIds}},
            {'operators.id': {$in: userStringIds}}
          ]
        }, {
          rid: 1,
          master: 1,
          operator: 1,
          operators: 1
        }).lean().exec(this.parallel());

        app.mongoose.model('ProdShift').find({
          $or: [
            {master: {$in: userStringIds}},
            {leader: {$in: userStringIds}},
            {operator: {$in: userStringIds}}
          ]
        }, {
          master: 1,
          leader: 1,
          operator: 1
        }).lean().exec(this.parallel());

        this.users = users;
      },
      function(err, pressWorksheets, prodShifts)
      {
        if (err)
        {
          return next(err);
        }

        var users = this.users;

        pressWorksheets.forEach(function(pressWorksheet)
        {
          if (users[pressWorksheet.master.id])
          {
            users[pressWorksheet.master.id].pressWorksheets.push(pressWorksheet._id);
          }

          if (users[pressWorksheet.operator.id])
          {
            users[pressWorksheet.operator.id].pressWorksheets.push(pressWorksheet._id);
          }

          pressWorksheet.operators.forEach(function(operator)
          {
            if (operator.id !== pressWorksheet.operator.id && users[operator.id])
            {
              users[operator.id].pressWorksheets.push(pressWorksheet._id);
            }
          });
        });

        prodShifts.forEach(function(prodShift)
        {
          if (prodShift.master && users[prodShift.master.id])
          {
            users[prodShift.master.id].prodShifts.push(prodShift._id);
          }

          if (prodShift.leader && users[prodShift.leader.id])
          {
            users[prodShift.leader.id].prodShifts.push(prodShift._id);
          }

          if (prodShift.operator && users[prodShift.operator.id])
          {
            users[prodShift.operator.id].prodShifts.push(prodShift._id);
          }
        });

        users = lodash.values(users).sort(function(a, b)
        {
          return (b.pressWorksheets.length + b.prodShifts.length) - (a.pressWorksheets.length + a.prodShifts.length);
        });

        var groupedUsers = {};

        users.forEach(function(user)
        {
          if (!groupedUsers[user.personellId])
          {
            groupedUsers[user.personellId] = {
              _id: user.personellId,
              count: 0,
              users: []
            };
          }

          groupedUsers[user.personellId].count += user.pressWorksheets.length + user.prodShifts.length;
          groupedUsers[user.personellId].users.push(user);
        });

        var results = lodash.values(groupedUsers).sort(function(a, b)
        {
          return b.count - a.count;
        });

        return res.send(results);

        res.type('txt');
        res.write('personellId;lastName;firstName;worksheets;shifts;kdId;wmesId\r\n');

        results.forEach(function(result)
        {
          result.users.forEach(function(user)
          {
            res.write(result._id + ';' + user.lastName + ';' + user.firstName + ';' + user.pressWorksheets.length + ';' + user.prodShifts.length + ';' + user.kdId + ';' + user._id + '\r\n');
          });
        });

        res.end();
      }
    );
  }
};
