// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var moment = require('moment');
var _ = require('lodash');
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
    createdAt: {
      type: Date,
      required: true
    },
    creator: {},
    updatedAt: {
      type: Date,
      default: null
    },
    updater: {},
    flows: [hourlyPlanFlowSchema]
  }, {
    id: false
  });

  hourlyPlanSchema.index({date: -1, division: 1});
  hourlyPlanSchema.index({division: 1});

  hourlyPlanSchema.statics.TOPIC_PREFIX = 'hourlyPlans';

  hourlyPlanSchema.statics.createForShift = function(options, creator, done)
  {
    step(
      function queryProdFlowsStep()
      {
        mongoose.model('ProdFlow').getAllByDivisionId(options.division, this.next());
      },
      function handleProdFlowsQueryResultStep(err, prodFlows)
      {
        if (err)
        {
          return this.done(done, err);
        }

        this.flows = prodFlows.filter(function(prodFlow) { return !prodFlow.deactivatedAt; }).map(function(prodFlow)
        {
          return {
            id: prodFlow._id,
            name: prodFlow.name,
            hours: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0
            ]
          };
        }).sort(function(a, b)
        {
          return a.name.localeCompare(b.name);
        });
      },
      function createHourlyPlanStep()
      {
        var hourlyPlanData = {
          division: options.division,
          date: options.date,
          shift: options.shift,
          flows: this.flows,
          createdAt: new Date(),
          creator: creator
        };

        mongoose.model('HourlyPlan').create(hourlyPlanData, done);
      }
    );
  };

  hourlyPlanSchema.statics.recountPlannedQuantities = function(divisionId, shiftId, prodFlowId, activeProdLineIds, done)
  {
    step(
      function findHourlyPlanStep()
      {
        var firstShiftDate = new Date(shiftId.date.getTime());

        if (shiftId.no !== 1)
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
          return done(null, []);
        }

        var flow = _.find(hourlyPlan.flows, function(flow)
        {
          return flow.id.toString() === prodFlowId.toString();
        });

        if (!flow || flow.noPlan)
        {
          return done(null, []);
        }

        var i = shiftId.no === 1 ? 0 : shiftId.no === 2 ? 8 : 16;
        var l = i + 8;
        var plannedQuantities = flow.hours.slice(i, l);

        mongoose.model('ProdShift').setPlannedQuantities(activeProdLineIds, shiftId.date, plannedQuantities, done);
      }
    );
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
          recountPlannedQuantitiesInShift(divisionId, new Date(shiftMoment.valueOf()), i, flow, this.parallel());

          shiftMoment.add(8, 'hours');
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
          err.message
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
              err.message
            );

            return done();
          }

          _.forEach(prodShifts, function(prodShift)
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
