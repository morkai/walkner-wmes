// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  divisionsId: 'divisions',
  fteId: 'fte',
  orgUnitsId: 'orgUnits',
  prodShiftsId: 'prodShifts',
  settingsId: 'settings',
  planningId: 'planning'
};

exports.start = function startFteModule(app, module)
{
  const recountTimers = {};

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.sioId,
      module.config.divisionsId,
      module.config.fteId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.orgUnitsId,
      module.config.prodShiftsId,
      module.config.fteId
    ],
    () =>
    {
      app.broker.subscribe('production.prodLineActivated', message =>
      {
        schedulePlannedQuantitiesRecountForProdFlow(
          message.shiftId, message.prodFlow, message.activeProdLinesInProdFlow
        );
      });

      app.broker.subscribe('hourlyPlans.updated.*', message =>
      {
        scheduleAllPlannedQuantitiesRecount(message._id);
      });
    }
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.orgUnitsId,
      module.config.prodShiftsId,
      module.config.fteId,
      module.config.planningId
    ],
    () =>
    {
      app.broker.subscribe('planning.changes.created', message =>
      {
        const changedLines = message.isNew
          ? []
          : _.isEmpty(message.data.changedLines)
            ? null
            : message.data.changedLines.map(l => l._id);

        if (changedLines === null)
        {
          return;
        }

        updateHourlyPlansFromDailyPlan(new Date(message.plan), changedLines);
      });
    }
  );

  function schedulePlannedQuantitiesRecountForProdFlow(shiftId, prodFlowId, activeProdLineIds)
  {
    if (recountTimers[prodFlowId] !== undefined)
    {
      clearTimeout(recountTimers[prodFlowId]);
    }

    recountTimers[prodFlowId] = app.timeout(5000, () =>
    {
      delete recountTimers[prodFlowId];

      recountPlannedQuantities(shiftId, prodFlowId, activeProdLineIds);
    });
  }

  function recountPlannedQuantities(shiftId, prodFlowId, activeProdLineIds)
  {
    const division = app[module.config.orgUnitsId].getDivisionFor('prodFlow', prodFlowId);

    if (!division)
    {
      return module.error(`Couldn't find a division for prod flow [${prodFlowId}]`);
    }

    const HourlyPlan = app[module.config.mongooseId].model('HourlyPlan');

    HourlyPlan.recountPlannedQuantities(division._id, shiftId, prodFlowId, activeProdLineIds, (err, prodShifts) =>
    {
      if (err)
      {
        return module.error(`Failed to recount planned quantities for prod flow [${prodFlowId}]: ${err.message}`);
      }

      if (!Array.isArray(prodShifts) || !prodShifts.length)
      {
        return;
      }

      prodShifts.forEach(prodShift =>
      {
        app.broker.publish('hourlyPlans.quantitiesPlanned', {
          prodLine: prodShift.prodLine,
          prodShift: prodShift._id,
          date: prodShift.date,
          quantitiesDone: prodShift.toJSON().quantitiesDone
        });
      });
    });
  }

  function scheduleAllPlannedQuantitiesRecount(hourlyPlanId)
  {
    if (recountTimers[hourlyPlanId] !== undefined)
    {
      clearTimeout(recountTimers[hourlyPlanId]);
    }

    recountTimers[hourlyPlanId] = app.timeout(30000, () =>
    {
      delete recountTimers[hourlyPlanId];

      findAndRecountPlannedQuantities(hourlyPlanId);
    });
  }

  function findAndRecountPlannedQuantities(hourlyPlanId)
  {
    const HourlyPlan = app[module.config.mongooseId].model('HourlyPlan');

    HourlyPlan.findById(hourlyPlanId).exec((err, hourlyPlan) =>
    {
      if (err)
      {
        return module.error(
          `Failed to find hourly plan [${hourlyPlanId}] to recount planned quantities: ${err.message}`,
        );
      }

      if (hourlyPlan)
      {
        hourlyPlan.recountPlannedQuantities();
      }
    });
  }

  function updateHourlyPlansFromDailyPlan(planDate, changedLines)
  {
    const mongoose = app[module.config.mongooseId];
    const Plan = mongoose.model('Plan');
    const HourlyPlan = mongoose.model('HourlyPlan');
    const dailyMoment = moment.utc(planDate);
    const hourlyMoment = moment(dailyMoment.format('YYYY-MM-DD'), 'YYYY-MM-DD').hours(6);
    const divisions = {};
    const prodFlows = {};
    const prodLines = {};

    step(
      function()
      {
        if (changedLines.length)
        {
          setOrgUnitsForLines(changedLines, divisions, prodFlows, prodLines);

          setImmediate(this.next());
        }
      },
      function()
      {
        const pipeline = [
          {$match: {_id: planDate}},
          {$unwind: '$lines'}
        ];

        if (changedLines.length)
        {
          pipeline.push({$match: {
            'lines._id': {$in: Object.keys(prodLines)}
          }});
        }

        pipeline.push({$project: {
          _id: '$lines._id',
          hourlyPlan: '$lines.hourlyPlan'
        }});

        Plan.aggregate(pipeline, this.next());
      },
      function(err, results)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find hourly plan for lines: ${err.message}`));
        }

        results.forEach(result => prodLines[result._id] = result.hourlyPlan);

        setOrgUnitsForLines(Object.keys(prodLines), divisions, prodFlows, prodLines);

        setImmediate(this.next());
      },
      function()
      {
        const conditions = {
          date: hourlyMoment.toDate(),
          division: {$in: Object.keys(divisions)}
        };

        HourlyPlan.find(conditions).lean().exec(this.next());
      },
      function(err, hourlyPlans)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find existing hourly plans: ${err.message}`));
        }

        hourlyPlans.forEach(hourlyPlan =>
        {
          divisions[hourlyPlan.division].hourlyPlan = hourlyPlan;
        });

        _.forEach(divisions, (data, divisionId) =>
        {
          if (data.hourlyPlan !== null)
          {
            return;
          }

          const options = {
            division: divisionId,
            date: hourlyMoment.toDate(),
            shift: 1
          };

          HourlyPlan.createForShift(options, {label: 'System'}, this.group());
        });
      },
      function(err, newHourlyPlans)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to create new hourly plans: ${err.message}`));
        }

        (newHourlyPlans || []).forEach(hourlyPlan =>
        {
          app.broker.publish('hourlyPlans.created', {
            user: null,
            model: _.pick(hourlyPlan, ['_id', 'division', 'date', 'shift'])
          });

          divisions[hourlyPlan.division].hourlyPlan = hourlyPlan;
        });

        _.forEach(divisions, data =>
        {
          updateHourlyPlanFromDailyPlan(data.hourlyPlan, data.prodFlows, prodFlows, prodLines, this.group());
        });
      },
      function(err)
      {
        if (err)
        {
          return module.error(`Failed to update from plan [${dailyMoment.format('YYYY-MM-DD')}]: ${err.message}`);
        }
      }
    );
  }

  function updateHourlyPlanFromDailyPlan(hourlyPlan, divisionProdFlows, allProdFlows, allProdLines, done)
  {
    const mongoose = app[module.config.mongooseId];
    const HourlyPlan = mongoose.model('HourlyPlan');

    const flowToIndex = {};
    const update = {};
    const changes = [];

    hourlyPlan.flows.forEach((flow, i) => flowToIndex[flow.id] = i);

    divisionProdFlows.forEach(divisionProdFlowId =>
    {
      const flowIndex = flowToIndex[divisionProdFlowId];

      if (typeof flowIndex === 'undefined')
      {
        return;
      }

      const newValues = HourlyPlan.createEmptyHourlyPlan();

      allProdFlows[divisionProdFlowId].forEach(prodLineId =>
      {
        const lineHourlyPlan = allProdLines[prodLineId];

        if (_.isEmpty(lineHourlyPlan))
        {
          return;
        }

        for (let i = 0; i < 24; ++i)
        {
          newValues[i] += lineHourlyPlan[i];
        }
      });

      update[`flows.${flowIndex}.hours`] = newValues;

      changes.push({
        type: 'counts',
        _id: hourlyPlan._id.toString(),
        flowIndex,
        newValues
      });
    });

    HourlyPlan.collection.update({_id: hourlyPlan._id}, {$set: update}, err =>
    {
      if (err)
      {
        return done(new Error(`Failed to update hourly plan [${hourlyPlan._id}]: ${err.message}`));
      }

      changes.forEach(change =>
      {
        app.broker.publish(`hourlyPlans.updated.${change._id}`, change);
      });

      setImmediate(done);
    });
  }

  function setOrgUnitsForLines(lines, divisions, prodFlows, prodLines)
  {
    const orgUnits = app[module.config.orgUnitsId];

    lines.forEach(lineId =>
    {
      if (typeof prodLines[lineId] !== 'undefined')
      {
        return;
      }

      orgUnits.getProdFlowsFor('prodLine', lineId).forEach(prodFlow =>
      {
        const division = orgUnits.getDivisionFor(prodFlow);

        if (!divisions[division._id])
        {
          divisions[division._id] = {
            hourlyPlan: null,
            prodFlows: []
          };
        }

        divisions[division._id].prodFlows.push(prodFlow._id);

        orgUnits.getProdLinesFor(prodFlow).forEach(prodLine =>
        {
          prodLines[prodLine._id] = null;

          if (!prodFlows[prodFlow._id])
          {
            prodFlows[prodFlow._id] = [];
          }

          prodFlows[prodFlow._id].push(prodLine._id);
        });
      });
    });
  }
};
