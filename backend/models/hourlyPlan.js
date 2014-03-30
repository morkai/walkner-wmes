'use strict';

var moment = require('moment');
var lodash = require('lodash');
var step = require('h5.step');

module.exports = function setupHourlyPlanModel(app, mongoose)
{
  var hourlyPlanFlowSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    noPlan: {
      type: Boolean,
      default: false
    },
    level: {
      type: Number,
      min: 0,
      default: 0
    },
    hours: [Number]
  }, {
    _id: false
  });

  var hourlyPlanSchema = mongoose.Schema({
    division: {
      type: String,
      ref: 'Division',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    shift: {
      type: Number,
      min: 1,
      max: 3,
      required: true
    },
    locked: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      required: true
    },
    updatedAt: {
      type: Date,
      default: null
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creatorLabel: {
      type: String,
      required: true
    },
    updater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    updaterLabel: {
      type: String,
      default: null
    },
    flows: [hourlyPlanFlowSchema]
  }, {
    id: false
  });

  hourlyPlanSchema.index({date: -1, division: 1});
  hourlyPlanSchema.index({division: 1});

  hourlyPlanSchema.statics.TOPIC_PREFIX = 'hourlyPlans';

  hourlyPlanSchema.statics.createForShift = function(shiftId, user, done)
  {
    step(
      function queryProdFlowsStep()
      {
        mongoose.model('ProdFlow').getAllByDivisionId(shiftId.division, this.next());
      },
      function handleProdFlowsQueryResultStep(err, prodFlows)
      {
        if (err)
        {
          return this.done(done, err);
        }

        this.flows = prodFlows.map(function(prodFlow)
        {
          return {
            id: prodFlow.get('_id'),
            name: prodFlow.name,
            hours: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0
            ]
          };
        });
      },
      function createHourlyPlanStep()
      {
        var hourlyPlanData = {
          division: shiftId.division,
          date: shiftId.date,
          shift: shiftId.no,
          flows: this.flows,
          createdAt: new Date(),
          creator: user._id,
          creatorLabel: user.login
        };

        mongoose.model('HourlyPlan').create(hourlyPlanData, done);
      }
    );
  };

  hourlyPlanSchema.statics.recountPlannedQuantities = function(
    divisionId, shiftId, prodFlowId, activeProdLineIds, done)
  {
    var firstShiftDate = new Date(shiftId.date.getTime());

    if (shiftId !== 1)
    {
      firstShiftDate.setHours(6);
    }

    step(
      function findHourlyPlanStep()
      {
        var firstShiftDate = new Date(shiftId.date.getTime());

        if (shiftId !== 1)
        {
          firstShiftDate.setHours(6);
        }

        mongoose.model('HourlyPlan')
          .findOne({date: firstShiftDate, division: divisionId}, {flows: 1})
          .lean()
          .exec(this.next());
      },
      function handleHourlyPlan(err, hourlyPlan)
      {
        if (err)
        {
          return done(err);
        }

        if (!hourlyPlan)
        {
          return done(null, {});
        }

        var flow = lodash.find(hourlyPlan.flows, function(flow)
        {
          return flow.id.toString() === prodFlowId.toString();
        });

        if (!flow || flow.noPlan)
        {
          return done(null, {});
        }

        var i = shiftId.no === 1 ? 0 : shiftId.no === 2 ? 8 : 16;
        var l = i + 8;
        var plannedQuantities = flow.hours.slice(i, l);

        mongoose.model('ProdShift')
          .setPlannedQuantities(activeProdLineIds, shiftId.date, plannedQuantities, done);
      }
    );
  };

  hourlyPlanSchema.statics.lock = function(_id, user, done)
  {
    this.findOne({_id: _id}, {tasks: 0}, function(err, hourlyPlan)
    {
      if (err)
      {
        return done(err);
      }

      if (!hourlyPlan)
      {
        return done(new Error('UNKNOWN'));
      }

      hourlyPlan.lock(user, done);
    });
  };

  hourlyPlanSchema.methods.lock = function(user, done)
  {
    if (this.get('locked'))
    {
      return done(new Error('LOCKED'));
    }

    this.set({
      updatedAt: new Date(),
      locked: true
    });

    if (user)
    {
      this.set({
        updater: user._id,
        updaterLabel: user.login
      });
    }

    this.save(function(err, hourlyPlan)
    {
      if (err)
      {
        return done(err);
      }

      app.broker.publish('hourlyPlans.locked', {
        user: user,
        model: {
          _id: hourlyPlan.get('_id'),
          division: hourlyPlan.get('division'),
          date: hourlyPlan.get('date'),
          shift: hourlyPlan.get('shift')
        }
      });

      done(null, hourlyPlan);

      hourlyPlan.recountPlannedQuantities();
    });
  };

  hourlyPlanSchema.methods.recountPlannedQuantities = function(done)
  {
    var flows = this.flows;
    var division = this.division;
    var date = this.date;
    var shiftNo = this.shift;

    step(
      function()
      {
        for (var i = 0, l = flows.length; i < l; ++i)
        {
          var flow = flows[i];

          if (flow.noPlan)
          {
            continue;
          }

          var subdivisions = app.orgUnits.getSubdivisionsFor('prodFlow', flow.id);

          if (subdivisions.length !== 1 || subdivisions[0].type !== 'assembly')
          {
            continue;
          }

          recountPlannedQuantitiesInFlow(division, date, shiftNo, flow, this.parallel());
        }
      },
      done || function() {}
    );
  };

  function recountPlannedQuantitiesInFlow(divisionId, date, shiftNo, flow, done)
  {
    var shiftMoment = moment(date);

    step(
      function()
      {
        for (var i = 1; i <= 3; ++i)
        {
          recountPlannedQuantitiesInShift(
            divisionId, new Date(shiftMoment.valueOf()), i, flow, this.parallel()
          );

          shiftMoment.add('hours', 8);
        }
      },
      done || function() {}
    );
  }

  function recountPlannedQuantitiesInShift(divisionId, date, shiftNo, flow, done)
  {
    if (!done)
    {
      done = function() {};
    }

    app.production.getActiveProdLinesInProdFlow(flow.id, date, function(err, activeProdLineIds)
    {
      if (err)
      {
        app.hourlyPlans.error(
          "Failed to find active prod lines in prod flow [%s] for date [%s]: %s",
          flow.id,
          date,
          err.stack
        );

        return done();
      }

      if (activeProdLineIds.length === 0)
      {
        return done();
      }

      var i = shiftNo === 1 ? 0 : shiftNo === 2 ? 8 : 16;
      var l = i + 8;
      var plannedQuantities = flow.hours.slice(i, l);

      mongoose.model('ProdShift')
        .setPlannedQuantities(activeProdLineIds, date, plannedQuantities, function(err, prodShifts)
        {
          if (err)
          {
            app.hourlyPlans.error(
              "Failed to set planned quantities for date [%s] for prod lines [%s]: %s",
              date,
              activeProdLineIds.join(', '),
              err.stack
            );

            return done();
          }

          prodShifts.forEach(function(prodShift)
          {
            app.broker.publish('hourlyPlans.quantitiesPlanned', {
              prodLine: prodShift.prodLine,
              prodShift: prodShift._id,
              date: prodShift.date,
              quantitiesDone: prodShift.toJSON().quantitiesDone
            });
          });

          return done();
        });
    });
  }

  mongoose.model('HourlyPlan', hourlyPlanSchema);
};
