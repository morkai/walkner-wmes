// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');

module.exports = function setupHourlyPlanModel(app, mongoose)
{
  const hourlyPlanFlowSchema = new mongoose.Schema({
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

  const hourlyPlanSchema = new mongoose.Schema({
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

        this.flows = prodFlows
          .filter(prodFlow => !prodFlow.deactivatedAt)
          .map(prodFlow =>
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
          })
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      function createHourlyPlanStep()
      {
        const hourlyPlanData = {
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
        const firstShiftDate = new Date(shiftId.date.getTime());

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

        const flow = _.find(hourlyPlan.flows, flow => flow.id.toString() === prodFlowId.toString());

        if (!flow || flow.noPlan)
        {
          return done(null, []);
        }

        const i = shiftId.no === 1 ? 0 : shiftId.no === 2 ? 8 : 16;
        const l = i + 8;
        const plannedQuantities = flow.hours.slice(i, l);

        mongoose.model('ProdShift').setPlannedQuantities(activeProdLineIds, shiftId.date, plannedQuantities, done);
      }
    );
  };

  hourlyPlanSchema.methods.recountPlannedQuantities = function(done)
  {
    const flows = this.flows;
    const division = this.division;
    const date = this.date;
    const shiftNo = this.shift;

    step(
      function()
      {
        flows.forEach(flow =>
        {
          if (flow.noPlan)
          {
            return;
          }

          const subdivisions = app.orgUnits.getSubdivisionsFor('prodFlow', flow.id);

          if (subdivisions.length !== 1 || subdivisions[0].type !== 'assembly')
          {
            return;
          }

          recountPlannedQuantitiesInFlow(division, date, shiftNo, flow, this.group());
        });
      },
      done || function() {}
    );
  };

  function recountPlannedQuantitiesInFlow(divisionId, date, shiftNo, flow, done)
  {
    const shiftMoment = moment(date);

    step(
      function()
      {
        for (let i = 1; i <= 3; ++i)
        {
          recountPlannedQuantitiesInShift(divisionId, new Date(shiftMoment.valueOf()), i, flow, this.group());

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
          `Failed to find active prod lines in prod flow [${flow.id}] for date [${date}]: ${err.message}`
        );

        return done();
      }

      if (activeProdLineIds.length === 0)
      {
        return done();
      }

      const i = shiftNo === 1 ? 0 : shiftNo === 2 ? 8 : 16;
      const l = i + 8;
      const plannedQuantities = flow.hours.slice(i, l);
      const ProdShift = mongoose.model('ProdShift');

      ProdShift.setPlannedQuantities(activeProdLineIds, date, plannedQuantities, function(err, prodShifts)
      {
        if (err)
        {
          app.hourlyPlans.error(
            `Failed to set planned quantities for date [${date}] for prod lines [${activeProdLineIds.join(', ')}]: `
            + `${err.message}`,
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
