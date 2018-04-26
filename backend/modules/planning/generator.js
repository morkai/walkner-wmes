// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const deepEqual = require('deep-equal');
const levenSort = require('leven-sort');
const businessDays = require('../reports/businessDays');
const setUpAutoDowntimeCache = require('./autoDowntimeCache');

const ORDER_IGNORED_PROPERTIES = {
  incomplete: true
};
const ORDER_USER_PROPERTIES = [
  'quantityPlan',
  'lines',
  'ignored',
  'urgent'
];
const ORDER_URGENT_SOURCE = {
  plan: 1,
  added: 2,
  incomplete: 3,
  late: 4
};
const EMPTY_HOURLY_PLAN = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0
];
const HOUR_TO_INDEX = [
  18, 19, 20, 21, 22, 23, 0, 1,
  2, 3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17
];

module.exports = function setUpGenerator(app, module)
{
  /* eslint-disable new-cap */

  if (!module.config.generator)
  {
    return;
  }

  const DEV = app.options.env === 'development';
  const UNFROZEN_PLANS = DEV ? [] : [];
  const LOG_LINES = {};
  const LOG = DEV;
  const AUTO_GENERATE_NEXT = true || !DEV && UNFROZEN_PLANS.length === 0;
  const COMPARE_ORDERS = true || !DEV && UNFROZEN_PLANS.length === 0;
  const RESIZE_ORDERS = true;
  // sortSmallOrdersByManHours sortSmallOrdersByLeven sortOrdersByNameParts
  const ORDERS_SORTER = sortOrdersByNameParts;

  const log = LOG && DEV
    ? m => console.log(m)
    : () => {};

  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  const orderNamePartsCache = new Map();
  const autoDowntimeCache = setUpAutoDowntimeCache(app, module);
  const generatorOptions = new Map();
  const generatorQueue = [];
  let generatorTimer = null;
  let generatorState = null;

  app.broker.subscribe('app.started').setLimit(1).on('message', () =>
  {
    if (DEV)
    {
      UNFROZEN_PLANS.forEach(generatePlan);

      if (UNFROZEN_PLANS.length)
      {
        return;
      }

      const m = moment();

      if (m.hours() < 6)
      {
        m.subtract(1, 'days');
      }

      generatePlan(m.startOf('day').add(1, 'days').format('YYYY-MM-DD'));
    }
    else
    {
      generateActivePlans();
    }

    scheduleNextLastPlanGeneration();
  });

  app.broker.subscribe('planning.generator.requested', handleRequest);

  function scheduleNextLastPlanGeneration()
  {
    const now = moment();

    if (now.hours() === 5 && now.minutes() === 59)
    {
      generatePlan(now.format('YYYY-MM-DD'));

      setTimeout(scheduleNextLastPlanGeneration, 23 * 3600 * 1000);

      return;
    }

    const next = moment().startOf('day');

    if (now.hours() >= 6)
    {
      next.add(1, 'day');
    }

    next.hours(5).minutes(59);

    const delay = next.valueOf() - now.valueOf();

    if (delay < 60000)
    {
      setTimeout(scheduleNextLastPlanGeneration, delay + 1000);
    }
    else
    {
      setTimeout(scheduleNextLastPlanGeneration, Math.round(delay * 0.9));
    }
  }

  function handleRequest(message)
  {
    if (message.reloadAutoDowntimes)
    {
      autoDowntimeCache.clear();
    }

    if (!message.date)
    {
      generateActivePlans(!!message.forceDayAfterTomorrow, !!message.freezeFirstShiftOrders);
    }
    else
    {
      generatePlan(message.date);
    }
  }

  function createPlanGeneratorState(key)
  {
    const options = generatorOptions.get(key) || {};
    const lastMinute = moment(key, 'YYYY-MM-DD').hours(5).minutes(59);
    const lastMinuteStartTime = lastMinute.valueOf();
    const lastMinuteEndTime = lastMinuteStartTime + 60000;
    const now = Date.now();

    return {
      key: key,
      date: moment.utc(key, 'YYYY-MM-DD').toDate(),
      lastMinute: now >= lastMinuteStartTime && now < lastMinuteEndTime,
      freezeOrders: options.freezeOrders,
      cancelled: false,
      new: false,
      generateCallCount: 0,
      settings: null,
      autoDowntimes: null,
      orders: null,
      plan: null,
      orderStates: new Map(),
      orderStateQueues: null,
      lineStates: null,
      lineStateQueue: [],
      oldIncompleteOrders: new Map(),
      newIncompleteOrders: new Map(),
      incompleteOrders: new Map(),
      orderToLines: new Map(),
      resizedOrders: new Set(),
      hourlyPlanRecount: new Set(),
      changes: {
        addedOrders: new Map(),
        removedOrders: new Map(),
        changedOrders: new Map(),
        changedLines: new Map()
      },
      log: message => module.debug(`[generator] [${key}] ${message}`)
    };
  }

  function updateGeneratorOptions(planKey, options)
  {
    if (!generatorOptions.has(planKey))
    {
      generatorOptions.set(planKey, {});
    }

    Object.assign(generatorOptions.get(planKey), options);
  }

  function generateActivePlans(forceDayAfterTomorrow, freezeOrders)
  {
    const plansToGenerate = {};
    const date = moment.utc().startOf('day');

    Plan.find({_id: {$gt: date.toDate()}}, {_id: 1}).lean().exec((err, plans) =>
    {
      if (err)
      {
        module.error(`[generator] Failed to find active plans: ${err.message}`);
      }

      const now = moment();
      const d = now.day();
      const h = now.hours();
      const m = now.minutes();

      if (h < 5 || (h === 5 && m < 59))
      {
        const planKey = now.format('YYYY-MM-DD');

        // Today
        plansToGenerate[planKey] = true;

        updateGeneratorOptions(planKey, {freezeOrders});
      }

      // Tomorrow
      plansToGenerate[now.add(1, 'day').format('YYYY-MM-DD')] = true;

      if (forceDayAfterTomorrow || h > 17)
      {
        // Day after tomorrow
        plansToGenerate[now.add(1, 'day').format('YYYY-MM-DD')] = true;

        // Saturday & Sunday on Wednesday
        if (d === 3)
        {
          plansToGenerate[now.add(1, 'day').format('YYYY-MM-DD')] = true;
          plansToGenerate[now.add(1, 'day').format('YYYY-MM-DD')] = true;
        }
        // Monday on Thursday and Tuesday on Friday
        else if (d === 4 || d === 5)
        {
          plansToGenerate[now.add(2, 'day').format('YYYY-MM-DD')] = true;
        }
      }

      // Any additional plans
      plans.forEach(plan => plansToGenerate[moment.utc(plan._id).format('YYYY-MM-DD')] = true);

      Object.keys(plansToGenerate).forEach(date => generatePlan(date));
    });
  }

  function generatePlan(date)
  {
    const dateMoment = moment.utc(date, 'YYYY-MM-DD').startOf('day');

    if (!dateMoment.isValid())
    {
      return;
    }

    const planKey = dateMoment.format('YYYY-MM-DD');

    if (!generatorQueue.includes(planKey))
    {
      generatorQueue.push(planKey);

      app.broker.publish('planning.generator.started', {
        date: planKey
      });
    }

    if (generatorState !== null)
    {
      module.debug(`[generator] [${generatorState.key}] Cancelling...`);

      generatorState.cancelled = true;

      return;
    }

    if (generatorTimer !== null)
    {
      clearTimeout(generatorTimer);
    }

    generatorTimer = setTimeout(generateNextPlan, 1);
  }

  function generateNextPlan()
  {
    const planKey = generatorQueue.sort((a, b) => a.localeCompare(b)).shift();

    if (!planKey)
    {
      return;
    }

    generatorTimer = null;
    generatorState = createPlanGeneratorState(planKey);

    tryGeneratePlan(generatorState, () =>
    {
      step(
        function()
        {
          const nextPlanId = moment.utc(generatorState.date.getTime()).add(1, 'days').toDate();

          Plan.findById(nextPlanId, {_id: 1}).lean().exec(this.next());
        },
        function(err, nextPlan)
        {
          if (err)
          {
            module.error(`[generator] Failed to find the next plan: ${err.message}`);
          }

          if (generatorState.cancelled && !generatorQueue.includes(planKey))
          {
            generatorQueue.push(planKey);
          }

          if (!generatorQueue.includes(planKey))
          {
            generatorOptions.delete(planKey);
          }

          if (AUTO_GENERATE_NEXT && nextPlan)
          {
            const nextPlanKey = moment.utc(nextPlan._id).format('YYYY-MM-DD');

            if (!generatorQueue.includes(nextPlanKey))
            {
              generatorQueue.push(nextPlanKey);
            }
          }

          generatorState = null;

          setImmediate(generateNextPlan);
        }
      );
    });
  }

  function tryGeneratePlan(state, done)
  {
    const startedAt = Date.now();

    module.debug(`[generator] [${state.key}] Started...`);

    step(
      function checkFrozenStep()
      {
        const currentDay = moment();

        if (currentDay.hours() < 6)
        {
          currentDay.subtract(1, 'days');
        }

        if (!UNFROZEN_PLANS.includes(state.key) && state.date <= currentDay.toDate())
        {
          this.skip(new Error('Plan is frozen.'));
        }
      },
      function loadSettingsStep()
      {
        loadSettings(state, this.next());
      },
      function loadAutoDowntimesStep(err)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load settings: ${err.message}`));
        }

        loadAutoDowntimes(state, this.next());
      },
      function loadOrdersStep(err)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load auto downtimes: ${err.message}`));
        }

        loadOrders(state, 'plan', null, this.next());
      },
      function loadPlanStep(err)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load orders: ${err.message}`));
        }

        loadPlan(state, this.next());
      },
      function freezeOrdersStep(err)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load plan: ${err.message}`));
        }

        if (state.freezeOrders)
        {
          freezeOrders(state, this.next());
        }
      },
      function generatePlanStep(err)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to freeze orders: ${err.message}`));
        }

        doGeneratePlan(state, this.next());
      },
      function markIncompleteOrdersStep(err)
      {
        if (state.cancelled || err)
        {
          return this.skip(err);
        }

        state.newIncompleteOrders.forEach((newValue, orderNo) =>
        {
          const oldValue = state.oldIncompleteOrders.get(orderNo) || 0;

          state.oldIncompleteOrders.delete(orderNo);

          if (newValue === oldValue)
          {
            return;
          }

          const changedOrder = state.changes.changedOrders.get(orderNo);

          if (changedOrder)
          {
            changedOrder.changes.incomplete = [oldValue, newValue];
          }
          else
          {
            state.changes.changedOrders.set(orderNo, {
              _id: orderNo,
              changes: {
                incomplete: [oldValue, newValue]
              }
            });
          }

          const addedOrder = state.changes.addedOrders.get(orderNo);

          if (addedOrder)
          {
            addedOrder.incomplete = newValue;
          }
        });

        state.oldIncompleteOrders.forEach((oldValue, orderNo) =>
        {
          const changedOrder = state.changes.changedOrders.get(orderNo);

          if (changedOrder)
          {
            changedOrder.changes.incomplete = [oldValue, 0];
          }
          else
          {
            state.changes.changedOrders.set(orderNo, {
              _id: orderNo,
              changes: {
                incomplete: [oldValue, 0]
              }
            });
          }

          const addedOrder = state.changes.addedOrders.get(orderNo);

          if (addedOrder)
          {
            addedOrder.incomplete = 0;
          }
        });

        setImmediate(this.next());
      },
      function savePlanStep(err)
      {
        if (state.cancelled || err)
        {
          return this.skip(err);
        }

        state.log('Saving...');

        state.plan.save(this.next());
      },
      function finalizeStep(err)
      {
        if (state.cancelled)
        {
          state.log(`[generator] [${state.key}] Cancelled!`);

          return done();
        }

        if (err)
        {
          module.error(`[generator] [${state.key}] ${err.message}`);
        }
        else
        {
          state.log(`Finished in ${(Date.now() - startedAt) / 1000}s!`);

          savePlanChanges(state);
        }

        app.broker.publish('planning.generator.finished', {
          date: state.key
        });

        done();
      }
    );
  }

  function savePlanChanges(state)
  {
    const changes = state.new ? _.pick(state.changes, ['addedOrders']) : state.changes;
    let anyChanges = false;

    if (!state.new)
    {
      changes.changedLines.forEach(changedLine =>
      {
        const lineState = state.lineStates.get(changedLine._id);

        if (lineState.finalHash === lineState.initialHash)
        {
          changes.changedLines.delete(changedLine._id);
        }
      });
    }

    Object.keys(changes).forEach(key =>
    {
      anyChanges = anyChanges || changes[key].size > 0;
    });

    if (!anyChanges)
    {
      return;
    }

    const data = {};

    Object.keys(changes).forEach(key =>
    {
      if (changes[key].size)
      {
        data[key] = Array.from(changes[key].values());
      }
    });

    const planChange = new PlanChange({
      plan: state.plan._id,
      date: state.plan.updatedAt,
      user: null,
      data
    });

    planChange.save(err =>
    {
      if (err)
      {
        module.error(`[generator] [${state.key}] Failed to save changes: ${err.message}`);
      }
      else
      {
        app.broker.publish('planning.changes.created', planChange.toCreatedMessage(state.plan, state.new));
      }
    });
  }

  function loadSettings(state, done)
  {
    step(
      function findExistingStep()
      {
        state.log('Loading existing settings...');

        PlanSettings
          .findById(state.date)
          .exec(this.next());
      },
      function findPrevStep(err, settings)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load existing settings: ${err.message}`));
        }

        if (settings)
        {
          state.settings = settings.toGenerator();

          return this.skip();
        }

        state.log('Loading previous settings...');

        PlanSettings
          .findOne({_id: {$lt: state.date}})
          .sort({_id: -1})
          .exec(this.next());
      },
      function createNewStep(err, prevSettings)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load previous settings: ${err.message}`));
        }

        state.log(prevSettings ? 'Copying previous settings...' : 'Creating new settings...');

        const newSettings = prevSettings
          ? PlanSettings.copyFrom(state.date, prevSettings)
          : PlanSettings.createNew(state.date);

        newSettings.save(this.next());
      },
      function handleSaveStep(err, settings)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to save new settings: ${err.message}`));
        }

        state.settings = settings.toGenerator();
      },
      function(err)
      {
        if (state.settings)
        {
          state.freezeOrders = state.settings.freezeFirstShiftOrders;
        }

        done(err);
      }
    );
  }

  function loadAutoDowntimes(state, done)
  {
    state.log('Loading auto downtimes...');

    autoDowntimeCache.get(state.key, (err, autoDowntimes) =>
    {
      if (err)
      {
        return done(err);
      }

      state.autoDowntimes = autoDowntimes;

      setImmediate(done);
    });
  }

  function loadOrders(state, source, ids, done)
  {
    state.log(`Loading ${source} orders...`);

    if (!ids && !state.settings.mrps.length)
    {
      return done(new Error('No MRPs defined!'));
    }

    step(
      function findStep()
      {
        const conditions = ids ? {_id: {$in: ids}} : {
          scheduledStartDate: moment(state.key, 'YYYY-MM-DD').toDate(),
          mrp: {$in: state.settings.mrps}
        };

        Order
          .find(conditions, Plan.SAP_ORDER_FIELDS)
          .sort({_id: 1})
          .lean()
          .exec(this.next());
      },
      function prepareStep(err, sapOrders)
      {
        if (err || state.cancelled)
        {
          return this.skip(err);
        }

        state.log(`Preparing ${sapOrders.length} ${ids ? 'additional orders' : 'orders'}...`);

        if (!state.orders)
        {
          state.orders = new Map();
        }

        sapOrders.forEach(sapOrder =>
        {
          const mrpSettings = state.settings.mrp(sapOrder.mrp);

          if (!mrpSettings)
          {
            return;
          }

          const planOrder = Plan.createPlanOrder(source, sapOrder, mrpSettings.hardComponents);

          state.orders.set(sapOrder._id, planOrder);
        });

        setImmediate(this.next());
      },
      done
    );
  }

  function preparePlanOrder(state, planOrder)
  {
    if (planOrder.source === 'incomplete')
    {
      const incompleteOrder = state.incompleteOrders.get(planOrder._id);

      planOrder.urgent = true;
      planOrder.quantityPlan = state.lastMinute
        ? (planOrder.quantityTodo - planOrder.quantityDone)
        : incompleteOrder.incomplete;
      planOrder.lines = incompleteOrder.lines;
    }

    const quantityTodo = getQuantityTodo(state, planOrder);
    const {schedulingRate} = state.settings.mrp(planOrder.mrp);

    planOrder.kind = classifyPlanOrder(state, planOrder);
    planOrder.manHours = getManHours(planOrder.operation, quantityTodo, schedulingRate);
    planOrder.incomplete = quantityTodo;

    if (planOrder.quantityPlan >= 0)
    {
      state.newIncompleteOrders.set(planOrder._id, quantityTodo);
    }

    return planOrder;
  }

  function loadPlan(state, done)
  {
    state.log('Loading plan...');

    step(
      function findExistingStep()
      {
        Plan.findById(state.date).exec(this.next());
      },
      function createNewStep(err, existingPlan)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load existing plan: ${err.message}`));
        }

        if (existingPlan)
        {
          removeUnusedLines(existingPlan, state.settings);
        }
        else
        {
          state.new = true;
        }

        state.plan = existingPlan || new Plan({
          _id: state.date,
          createdAt: new Date(),
          updatedAt: null,
          orders: [],
          lines: []
        });

        if (!UNFROZEN_PLANS.includes(state.key) && state.plan.frozen)
        {
          return this.skip(new Error('Plan is frozen.'));
        }

        setImmediate(this.next());
      },
      function loadAddedOrdersStep()
      {
        if (state.new)
        {
          return;
        }

        const addedOrders = [];

        state.plan.orders.forEach(planOrder =>
        {
          if (planOrder.source === 'added' && !state.orders.has(planOrder._id))
          {
            addedOrders.push(planOrder._id);
          }
        });

        if (addedOrders.length)
        {
          loadOrders(state, 'added', addedOrders, this.next());
        }
      },
      function loadIncompleteOrdersStep()
      {
        loadIncompleteOrders(state, this.next());
      },
      function compareOrdersStep()
      {
        if (state.new)
        {
          state.plan.orders = Array.from(state.orders.values())
            .map(order => preparePlanOrder(state, order))
            .filter(order => filterPlanOrder(state, order) === null);

          state.plan.orders.forEach(order => state.changes.addedOrders.set(order._id, order));

          state.log(`Classified ${state.plan.orders.length} new orders!`);

          setImmediate(this.next());
        }
        else
        {
          compareOrders(state, this.next());
        }
      },
      done
    );
  }

  function freezeOrders(state, done)
  {
    const anyAlreadyFrozen = state.plan.lines.find(planLine => planLine.frozenOrders.length > 0);

    if (!anyAlreadyFrozen)
    {
      state.log('Freezing first shift orders...');

      state.plan.lines.forEach(freezeLineOrders);
    }

    setImmediate(done);
  }

  function freezeLineOrders(planLine)
  {
    planLine.frozenOrders = [];

    planLine.orders.forEach(lineOrder =>
    {
      const lastFrozenOrder = _.last(planLine.frozenOrders);

      if (lastFrozenOrder && lineOrder.orderNo === lastFrozenOrder.orderNo)
      {
        lastFrozenOrder.quantity += lineOrder.quantity;
      }
      else
      {
        planLine.frozenOrders.push({
          orderNo: lineOrder.orderNo,
          quantity: lineOrder.quantity
        });
      }
    });
  }

  function isWorkDay(state, date, done)
  {
    if (businessDays.isHoliday(date))
    {
      return done(null, false);
    }

    const conditions = {
      scheduledStartDate: date,
      statuses: {$in: state.settings.requiredStatuses}
    };

    Order.find(conditions, {_id: 1}).limit(1).exec((err, results) =>
    {
      if (err)
      {
        return done(err);
      }

      done(null, results.length === 1);
    });
  }

  function findPreviousWorkDay(state, planMoment, done)
  {
    const prevPlanId = planMoment.subtract(1, 'days').toDate();

    isWorkDay(state, prevPlanId, (err, workDay) =>
    {
      if (err)
      {
        return done(err);
      }

      if (workDay)
      {
        return done(null, planMoment);
      }

      findPreviousWorkDay(state, planMoment, done);
    });
  }

  function loadIncompleteOrders(state, done)
  {
    const planLocalMoment = moment(state.key, 'YYYY-MM-DD');

    step(
      function()
      {
        isWorkDay(state, planLocalMoment.toDate(), this.next());
      },
      function(err, workDay)
      {
        if (err || !workDay)
        {
          return this.skip(err);
        }

        findPreviousWorkDay(state, planLocalMoment, this.next());
      },
      function(err, prevPlanId)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.prevPlanId = moment.utc(prevPlanId.format('YYYY-MM-DD'), 'YYYY-MM-DD').toDate();

        const pipeline = [
          {$match: {_id: this.prevPlanId}},
          {$unwind: '$orders'},
          {$match: {'orders.incomplete': {$gt: 0}}},
          {$project: {
            _id: '$orders._id',
            incomplete: '$orders.incomplete',
            date: '$orders.date'
          }}
        ];

        Plan.aggregate(pipeline, this.next());
      },
      function(err, incompleteOrders)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find incomplete orders: ${err.message}`));
        }

        this.incompleteOrderIds = [];

        incompleteOrders.forEach(order =>
        {
          if (moment(order.date, 'YYYY-MM-DD').diff(planLocalMoment, 'days') < -6)
          {
            return;
          }

          this.incompleteOrderIds.push(order._id);

          order.lines = [];

          state.incompleteOrders.set(order._id, order);
        });

        if (!this.incompleteOrderIds.length)
        {
          return this.skip();
        }

        const pipeline = [
          {$match: {_id: this.prevPlanId}},
          {$unwind: '$lines'},
          {$unwind: '$lines.orders'},
          {$match: {'lines.orders.orderNo': {$in: this.incompleteOrderIds}}},
          {$group: {
            _id: {
              line: '$lines._id',
              orderNo: '$lines.orders.orderNo'
            },
            quantity: {$sum: '$lines.orders.quantity'}
          }},
          {$sort: {quantity: -1}},
          {$project: {
            _id: '$_id.orderNo',
            line: '$_id.line'
          }}
        ];

        Plan.aggregate(pipeline, this.next());
      },
      function(err, incompleteLineOrders)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find incomplete line orders: ${err.message}`));
        }

        incompleteLineOrders.forEach(order =>
        {
          state.incompleteOrders.get(order._id).lines.push(order.line);
        });

        loadOrders(state, 'incomplete', this.incompleteOrderIds, this.next());
      },
      done
    );
  }

  function removeUnusedLines(plan, settings)
  {
    plan.lines = plan.lines.filter(line => settings.lines.includes(line._id));
  }

  function filterPlanOrder(state, planOrder)
  {
    if (planOrder.source === 'incomplete' && planOrder.quantityPlan <= 0)
    {
      state.newIncompleteOrders.delete(planOrder._id);

      return {
        _id: planOrder._id,
        reason: 'INCOMPLETE_DONE',
        data: {}
      };
    }

    const actualStatuses = new Set();

    for (let i = 0; i < planOrder.statuses.length; ++i)
    {
      const actualStatus = planOrder.statuses[i];

      if (state.settings.ignoredStatuses.has(actualStatus))
      {
        state.newIncompleteOrders.delete(planOrder._id);

        return {
          _id: planOrder._id,
          reason: 'IGNORED_STATUS',
          data: {
            actualStatuses: planOrder.statuses,
            ignoredStatus: actualStatus
          }
        };
      }

      actualStatuses.add(actualStatus);
    }

    for (let i = 0; i < state.settings.requiredStatuses.length; ++i)
    {
      const requiredStatus = state.settings.requiredStatuses[i];

      if (!actualStatuses.has(requiredStatus))
      {
        state.newIncompleteOrders.delete(planOrder._id);

        return {
          _id: planOrder._id,
          reason: 'REQUIRED_STATUS',
          data: {
            actualStatuses: planOrder.statuses,
            requiredStatus
          }
        };
      }
    }

    return null;
  }

  function classifyPlanOrder(state, planOrder)
  {
    if (isSmallOrder(state, planOrder))
    {
      return 'small';
    }

    if (isHardOrder(state, planOrder))
    {
      return 'hard';
    }

    return 'easy';
  }

  function getQuantityTodo(state, planOrder)
  {
    if (planOrder.quantityPlan > 0)
    {
      return planOrder.quantityPlan;
    }

    if (state.settings.useRemainingQuantity)
    {
      return Math.max(planOrder.quantityTodo - planOrder.quantityDone, 0);
    }

    return planOrder.quantityTodo;
  }

  function isSmallOrder(state, planOrder)
  {
    const quantityTodo = getQuantityTodo(state, planOrder);
    const bigOrderQuantity = state.settings.mrp(planOrder.mrp).bigOrderQuantity;

    return bigOrderQuantity === 0 || quantityTodo < bigOrderQuantity;
  }

  function isHardOrder(state, planOrder)
  {
    // Has a hard component
    if (planOrder.hardComponent !== null)
    {
      return true;
    }

    if (!planOrder.operation.laborTime)
    {
      return false;
    }

    const hardOrderManHours = state.settings.mrp(planOrder.mrp).hardOrderManHours;

    if (hardOrderManHours <= 0)
    {
      return false;
    }

    return planOrder.manHours >= hardOrderManHours;
  }

  function compareOrders(state, done)
  {
    if (!COMPARE_ORDERS)
    {
      state.log('Not comparing orders!');

      return done();
    }

    const oldPlanOrders = state.plan.orders;
    const newPlanOrders = [];
    const latestOrders = state.orders;

    state.log(`Comparing ${oldPlanOrders.length} old with ${latestOrders.size} new orders...`);

    oldPlanOrders.forEach(oldOrder =>
    {
      const latestOrder = latestOrders.get(oldOrder._id);

      if (!latestOrder)
      {
        state.changes.removedOrders.set(oldOrder._id, {
          _id: oldOrder._id,
          reason: 'MISSING_ORDER'
        });

        return;
      }

      if (compareOrder(state, oldOrder, latestOrder))
      {
        newPlanOrders.push(latestOrder);
      }

      latestOrders.delete(latestOrder._id);
    });

    latestOrders.forEach(latestOrder =>
    {
      preparePlanOrder(state, latestOrder);

      if (filterPlanOrder(state, latestOrder) === null)
      {
        newPlanOrders.push(latestOrder);

        state.changes.addedOrders.set(latestOrder._id, latestOrder);
      }
    });

    latestOrders.clear();

    newPlanOrders.forEach(planOrder =>
    {
      latestOrders.set(planOrder._id, planOrder);
    });

    state.plan.orders = newPlanOrders;

    const added = state.changes.addedOrders.size;
    const changed = state.changes.changedOrders.size;
    const removed = state.changes.removedOrders.size;

    state.log(`Added ${added}, changed ${changed} and removed ${removed} orders!`);

    setImmediate(done);
  }

  function compareOrder(state, oldOrder, latestOrder)
  {
    Object.assign(latestOrder, _.pick(oldOrder, ORDER_USER_PROPERTIES));

    preparePlanOrder(state, latestOrder);

    const removedOrder = filterPlanOrder(state, latestOrder);

    if (removedOrder !== null)
    {
      state.changes.removedOrders.set(removedOrder._id, removedOrder);

      return false;
    }

    if (oldOrder.incomplete)
    {
      state.oldIncompleteOrders.set(oldOrder._id, oldOrder.incomplete);
    }

    const changes = {};
    let changed = false;

    Object.keys(latestOrder).forEach(key =>
    {
      if (ORDER_IGNORED_PROPERTIES[key])
      {
        return;
      }

      const oldValue = oldOrder[key] && oldOrder[key].toObject ? oldOrder[key].toObject() : oldOrder[key];
      const newValue = latestOrder[key] && latestOrder[key].toObject ? latestOrder[key].toObject() : latestOrder[key];

      if (key === 'operation' && !_.isEmpty(oldValue) && _.isEmpty(newValue))
      {
        latestOrder[key] = oldValue;

        return;
      }

      if (newValue === oldValue || deepEqual(newValue, oldValue))
      {
        return;
      }

      changes[key] = [oldValue, newValue];
      changed = true;
    });

    if (changed)
    {
      state.changes.changedOrders.set(oldOrder._id, {
        _id: oldOrder._id,
        changes
      });
    }

    return true;
  }

  function doGeneratePlan(state, done)
  {
    state.log('Generating...');

    step(
      function()
      {
        createOrderStateQueues(state, this.next());
      },
      function()
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        createLineStates(state, this.next());
      },
      function()
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        generatePlanForLines(1, state, this.next());
      },
      function()
      {
        if (RESIZE_ORDERS)
        {
          resizeAndFillLines(state, this.next());
        }
      },
      function()
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        state.hourlyPlanRecount.forEach(lineId => recountHourlyPlan(state.plan.lines.find(l => l._id === lineId)));

        setImmediate(this.next());
      },
      done
    );
  }

  function createOrderStateQueues(state, done)
  {
    state.orderStateQueues = new Map();

    state.plan.orders.forEach(planOrder =>
    {
      if (planOrder.ignored || !planOrder.operation.laborTime)
      {
        return;
      }

      if (!state.orderStateQueues.has(planOrder.mrp))
      {
        state.orderStateQueues.set(planOrder.mrp, {
          urgent: [],
          small: [],
          easy: [],
          hard: []
        });
      }

      const orderStateQueue = state.orderStateQueues.get(planOrder.mrp);
      const orderState = {
        order: planOrder,
        lines: getAvailablePinnedLines(state, planOrder),
        quantityTodo: getQuantityTodo(state, planOrder),
        maxQuantityPerLine: 0,
        startTimes: [],
        frozenOnLines: [],
        timeDiff: 0,
        name: planOrder.name, // eslint-disable-line comma-dangle
        nameParts: getOrderNameParts(planOrder),
        nameRank: 0
      };

      if (planOrder.urgent)
      {
        orderStateQueue.urgent.push(orderState);
      }
      else
      {
        orderStateQueue[planOrder.kind].push(orderState);
      }

      state.orderStates.set(planOrder._id, orderState);
    });

    for (const orderStateQueues of state.orderStateQueues.values())
    {
      orderStateQueues.urgent.sort(sortUrgentOrders);
      orderStateQueues.hard.sort(sortHardOrders);

      ORDERS_SORTER(orderStateQueues, 'small', null);
      ORDERS_SORTER(orderStateQueues, 'easy', _.last(orderStateQueues.small));
    }

    setImmediate(done);
  }

  function getAvailablePinnedLines(state, planOrder)
  {
    return planOrder.lines.length === 0
      ? []
      : _.intersection(
        planOrder.lines,
        state.settings.mrp(planOrder.mrp).lines.filter(l => l.workerCount > 0).map(l => l._id)
      );
  }

  function sortUrgentOrders(a, b)
  {
    const aOrder = a.order;
    const bOrder = b.order;

    if (aOrder.lines.length && !bOrder.lines.length)
    {
      return -1;
    }

    if (bOrder.lines.length && !aOrder.lines.length)
    {
      return 1;
    }

    const cmp = ORDER_URGENT_SOURCE[bOrder.source] - ORDER_URGENT_SOURCE[aOrder.source];

    if (cmp !== 0)
    {
      return cmp;
    }

    if (aOrder.quantityDone > 0 && bOrder.quantityDone === 0)
    {
      return -1;
    }

    if (bOrder.quantityDone > 0 && aOrder.quantityDone === 0)
    {
      return 1;
    }

    return a.quantityTodo - b.quantityTodo;
  }

  function sortOrdersByManHours(orderStateQueues, kind) // eslint-disable-line no-unused-vars
  {
    orderStateQueues[kind].sort(sortEasyOrders);
  }

  function sortOrdersByLeven(orderStateQueues, kind) // eslint-disable-line no-unused-vars
  {
    const unsortedQueue = orderStateQueues[kind];

    if (unsortedQueue.length <= 1)
    {
      return;
    }

    unsortedQueue.sort(sortEasyOrders);

    if (unsortedQueue.length === 2)
    {
      return;
    }

    const sortedQueue = [
      unsortedQueue.shift()
    ];

    while (unsortedQueue.length)
    {
      levenSort(unsortedQueue, _.last(sortedQueue).name, 'name');

      sortedQueue.push(unsortedQueue.shift());
    }

    orderStateQueues[kind] = sortedQueue;
  }

  function sortOrdersByNameParts(orderStateQueues, kind, lastPrevKind) // eslint-disable-line no-unused-vars
  {
    const unsortedQueue = orderStateQueues[kind];

    if (unsortedQueue.length <= 1)
    {
      return;
    }

    unsortedQueue.sort(sortEasyOrders);

    if (unsortedQueue.length === 2)
    {
      return;
    }

    const sortedQueue = [];

    if (!lastPrevKind)
    {
      sortedQueue.push(unsortedQueue.shift());
    }

    while (unsortedQueue.length)
    {
      const lastNameParts = sortedQueue.length === 0 ? lastPrevKind.nameParts : _.last(sortedQueue).nameParts;

      for (let i = 0; i < unsortedQueue.length; ++i)
      {
        rankOrderName(unsortedQueue[i], lastNameParts);
      }

      unsortedQueue.sort(sortOrdersByNameRank);

      sortedQueue.push(unsortedQueue.shift());
    }

    orderStateQueues[kind] = sortedQueue;
  }

  function sortOrdersByNameRank(a, b)
  {
    return b.nameRank - a.nameRank;
  }

  function getOrderNameParts(order) // eslint-disable-line no-unused-vars
  {
    if (!orderNamePartsCache.has(order.name))
    {
      const orderNameParts = {
        family: order.name.substring(0, 6),
        dimensions: null,
        parts: []
      };

      order.name.substring(6).trim().split(' ').forEach(part =>
      {
        if (/^W[0-9]+L[0-9]+$/.test(part))
        {
          orderNameParts.dimensions = part;
        }
        else
        {
          orderNameParts.parts.push(part);
        }
      });

      orderNamePartsCache.set(order.name, orderNameParts);
    }

    return orderNamePartsCache.get(order.name);
  }

  function rankOrderName(orderState, lastNameParts)
  {
    orderState.nameRank = orderState.nameParts.family === lastNameParts.family ? 6 : 0;

    if (orderState.nameParts.dimensions !== null || lastNameParts.dimensions !== null)
    {
      orderState.nameRank += orderState.nameParts.dimensions === lastNameParts.dimensions ? 4 : 0;
    }

    lastNameParts.parts.forEach(namePart =>
    {
      if (orderState.nameParts.parts.includes(namePart))
      {
        orderState.nameRank += 1;
      }
    });
  }

  function sortEasyOrders(a, b)
  {
    return b.order.manHours - a.order.manHours;
  }

  function sortHardOrders(a, b)
  {
    if (a.order.hardComponent === b.order.hardComponent)
    {
      return b.order.manHours - a.order.manHours;
    }

    if (a.order.hardComponent !== null && b.order.hardComponent === null)
    {
      return -1;
    }

    return 1;
  }

  function createLineStates(state, done)
  {
    state.lineStates = new Map();

    state.settings.lines.forEach(lineId =>
    {
      const lineSettings = state.settings.line(lineId);
      const planLine = state.plan.lines.find(l => l._id === lineId);
      const frozenOrders = !planLine || !planLine.frozenOrders ? [] : planLine.frozenOrders.filter(frozenOrder =>
      {
        const order = state.orders.get(frozenOrder.orderNo);

        return order && lineSettings.mrpPriority.includes(order.mrp);
      });
      const activeTimes = createActiveTimes(state.date.getTime(), lineSettings.activeTime);
      const activeTime = activeTimes.shift();
      const lineState = {
        _id: lineId,
        completed: false,
        shiftNo: -1,
        activeTimes,
        activeFrom: activeTime.from,
        activeTo: activeTime.to,
        nextDowntime: state.autoDowntimes.get(lineId),
        downtimes: [],
        skippedLateOrders: [],
        orderStateQueue: createLineOrderStateQueue(state, lineId, lineSettings.mrpPriority, frozenOrders),
        bigOrderStateQueue: [],
        triedOrdersSet: new Set(),
        unresizablePlannedOrdersSet: new Set(),
        plannedOrdersSet: new Set(),
        plannedOrdersList: [],
        frozenOrdersMap: new Map(frozenOrders.map(o => [o.orderNo, o.quantity])),
        hourlyPlan: EMPTY_HOURLY_PLAN.slice(),
        hash: frozenOrders.map(o => `${o.orderNo}:${o.quantity}`).join(':'),
        initialHash: planLine ? planLine.hash : '',
        finalHash: ''
      };

      lineState.shiftNo = getShiftFromMoment(lineState.activeFrom);

      state.lineStates.set(lineId, lineState);

      state.lineStateQueue.push(lineState);
    });

    setImmediate(done);
  }

  function createLineOrderStateQueue(state, lineId, mrpPriority, frozenOrders)
  {
    const urgentOrderStates = [];
    let lineOrderStateQueue = [];

    mrpPriority.forEach(mrpId =>
    {
      const mrpLineSettings = state.settings.mrpLine(mrpId, lineId);
      const mrpOrderStateQueue = state.orderStateQueues.get(mrpId);

      if (!mrpOrderStateQueue)
      {
        return;
      }

      mrpOrderStateQueue.urgent.forEach(orderState =>
      {
        if (mrpLineSettings.orderPriority.includes(orderState.order.kind))
        {
          urgentOrderStates.push(orderState);
        }
      });

      mrpLineSettings.orderPriority.forEach(orderPriority =>
      {
        lineOrderStateQueue = lineOrderStateQueue.concat(mrpOrderStateQueue[orderPriority]);
      });
    });

    frozenOrders.forEach(frozenOrder =>
    {
      const frozenOrderState = state.orderStates.get(frozenOrder.orderNo);

      if (!frozenOrderState)
      {
        return;
      }

      frozenOrderState.frozenOnLines.push(lineId);

      if (!frozenOrderState.order.urgent)
      {
        urgentOrderStates.push(frozenOrderState);
      }
    });

    return urgentOrderStates.concat(lineOrderStateQueue);
  }

  function createActiveTimes(planTime, rawActiveTimes)
  {
    if (_.isEmpty(rawActiveTimes))
    {
      rawActiveTimes = [{from: '06:00', to: '06:00'}];
    }

    return rawActiveTimes.map(rawActiveTime => ({
      from: createMomentFromActiveTime(planTime, rawActiveTime.from, true),
      to: createMomentFromActiveTime(planTime, rawActiveTime.to, false)
    }));
  }

  function createMomentFromActiveTime(planTime, activeTimeString, from)
  {
    const matches = activeTimeString.match(/([0-9]{1,2})(?::([0-9]{1,2}))?/);
    const hours = matches && matches[1] < 24 ? +matches[1] : 6;
    const minutes = matches && matches[2] < 60 ? +matches[2] : 0;
    const activeTimeMoment = moment.utc(planTime);

    if (hours < 6 || (!from && hours <= 6 && minutes === 0))
    {
      activeTimeMoment.add(1, 'days');
    }

    return activeTimeMoment.hours(hours).minutes(minutes);
  }

  function getShiftFromMoment(moment)
  {
    const hours = moment.hours();

    return hours >= 6 && hours < 14 ? 1 : hours >= 14 && hours < 22 ? 2 : 3;
  }

  function generatePlanForLines(increment, state, done)
  {
    if (state.cancelled || !state.lineStateQueue.length)
    {
      return done();
    }

    state.generateCallCount += increment;

    generatePlanForLine(state, state.lineStateQueue.shift(), () => generatePlanForLines(0, state, done));
  }

  function generatePlanForLine(state, lineState, done)
  {
    if (!LOG_LINES || LOG_LINES[lineState._id])
    {
      log(`[${lineState._id}] Generating (${state.generateCallCount})...`);
    }

    if (hasAnyWorkers(state, lineState))
    {
      while (!lineState.completed)
      {
        const orderState = getNextOrderForLine(state, lineState);

        if (!orderState)
        {
          break;
        }

        handleOrderState(state, lineState, orderState, false);
      }
    }
    else if (!LOG_LINES || LOG_LINES[lineState._id])
    {
      log(`[${lineState._id}] No workers!`);
    }

    setImmediate(completeLine, state, lineState, done);
  }

  function hasAnyWorkers(state, lineState)
  {
    return state.settings.line(lineState._id).mrpPriority.some(
      mrpId => state.settings.mrpLine(mrpId, lineState._id).workerCount > 0
    );
  }

  function handleOrderState(state, lineState, orderState, trying)
  {
    lineState.triedOrdersSet.add(orderState.order._id);

    if (orderState.order.kind === 'small')
    {
      return (trying ? trySmallOrder : handleSmallOrder)(state, lineState, orderState);
    }

    return handleBigOrder(state, lineState, orderState, trying);
  }

  function completeLine(state, lineState, done)
  {
    if (!done)
    {
      done = () => {};
    }

    if (lineState.activeTimes.length)
    {
      const nextActiveTime = lineState.activeTimes.shift();

      lineState.activeFrom = nextActiveTime.from;
      lineState.activeTo = nextActiveTime.to;

      lineState.triedOrdersSet.forEach(triedOrderNo =>
      {
        if (lineState.plannedOrdersSet.has(triedOrderNo))
        {
          return;
        }

        const triedOrderState = state.orderStates.get(triedOrderNo);

        if (triedOrderState.quantityTodo > 0)
        {
          lineState.orderStateQueue.unshift(triedOrderState);
        }
      });

      if (lineState.plannedOrdersList.length)
      {
        lineState.unresizablePlannedOrdersSet.add(_.last(lineState.plannedOrdersList).orderNo);
      }

      if (lineState.orderStateQueue.length)
      {
        lineState.completed = false;

        state.lineStateQueue.unshift(lineState);

        if (!LOG_LINES || LOG_LINES[lineState._id])
        {
          log(`Continuing ${lineState._id} from ${lineState.activeFrom.format('HH:mm:ss')}...`);
        }

        return setImmediate(done);
      }
    }

    lineState.completed = true;

    const oldPlanLine = state.plan.lines.find(planLine => planLine._id === lineState._id);
    const newPlanLine = {
      _id: lineState._id,
      version: 1,
      hash: createHash('md5').update(lineState.hash).digest('hex'),
      orders: lineState.plannedOrdersList,
      downtimes: lineState.downtimes,
      hourlyPlan: lineState.hourlyPlan,
      shiftData: null,
      frozenOrders: oldPlanLine ? oldPlanLine.frozenOrders : []
    };

    lineState.finalHash = newPlanLine.hash;

    if (!oldPlanLine)
    {
      calculateShiftData(newPlanLine);

      state.plan.lines.push(newPlanLine);

      state.changes.changedLines.set(newPlanLine._id, {
        _id: newPlanLine._id,
        version: newPlanLine.version
      });

      if (!LOG_LINES || LOG_LINES[lineState._id])
      {
        log(`Completed: pushed new line: ${lineState._id}`);
      }

      return setImmediate(done);
    }

    if (oldPlanLine.hash !== newPlanLine.hash)
    {
      calculateShiftData(newPlanLine);

      if (lineState.initialHash !== newPlanLine.hash)
      {
        newPlanLine.version = oldPlanLine.version + 1;

        state.changes.changedLines.set(oldPlanLine._id, {
          _id: oldPlanLine._id,
          version: oldPlanLine.version
        });
      }

      Object.assign(oldPlanLine, newPlanLine);

      if (!LOG_LINES || LOG_LINES[lineState._id])
      {
        log(`Completed: changed existing line: ${lineState._id}. New version: ${oldPlanLine.version}`);
      }

      return setImmediate(done);
    }

    if (!LOG_LINES || LOG_LINES[lineState._id])
    {
      log(`Completed: no changes: ${lineState._id}!`);
    }

    return setImmediate(done);
  }

  function calculateShiftData(planLine)
  {
    const shiftData = [
      {manHours: 0, quantity: 0, orderCount: 0},
      {manHours: 0, quantity: 0, orderCount: 0},
      {manHours: 0, quantity: 0, orderCount: 0}
    ];

    planLine.orders.forEach(planLineOrder =>
    {
      const h = planLineOrder.startAt.getUTCHours();
      const shift = shiftData[h >= 6 && h < 14 ? 0 : h >= 14 && h < 22 ? 1 : 2];

      shift.manHours += planLineOrder.manHours;
      shift.quantity += planLineOrder.quantity;
      shift.orderCount += 1;
    });

    planLine.shiftData = shiftData;
  }

  function isOrderPinnedToLine(orderState, lineState)
  {
    if (orderState.lines.length === 0)
    {
      return false;
    }

    return orderState.lines[0] !== lineState._id;
  }

  function getNextOrderForLine(state, lineState)
  {
    // Urgent orders
    const timeForLateOrders = isTimeForLateOrders(state, lineState);

    if (timeForLateOrders && lineState.skippedLateOrders.length)
    {
      lineState.orderStateQueue = lineState.skippedLateOrders.concat(lineState.orderStateQueue);
      lineState.skippedLateOrders = [];
    }

    while (lineState.orderStateQueue.length)
    {
      if (!timeForLateOrders || !lineState.orderStateQueue[0].order.urgent)
      {
        break;
      }

      const urgentOrderState = lineState.orderStateQueue.shift();

      if (!timeForLateOrders && urgentOrderState.order.source === 'added')
      {
        lineState.skippedLateOrders.push(urgentOrderState);

        continue;
      }

      if (lineState.plannedOrdersSet.has(urgentOrderState.order._id)
        || urgentOrderState.quantityTodo === 0
        || isOrderPinnedToLine(urgentOrderState, lineState))
      {
        continue;
      }

      return urgentOrderState;
    }

    // Frozen orders
    while (lineState.orderStateQueue.length)
    {
      if (!lineState.frozenOrdersMap.has(lineState.orderStateQueue[0].order._id))
      {
        break;
      }

      const frozenOrderState = lineState.orderStateQueue.shift();

      if (lineState.plannedOrdersSet.has(frozenOrderState.order._id)
        || frozenOrderState.quantityTodo === 0)
      {
        continue;
      }

      return frozenOrderState;
    }

    // Big order parts
    const bigOrderIdSet = new Set();

    if (lineState.bigOrderStateQueue.length)
    {
      const activeFromTime = lineState.activeFrom.valueOf();
      const bigOrderStateQueue = [];

      lineState.bigOrderStateQueue.forEach(orderState =>
      {
        if (lineState.plannedOrdersSet.has(orderState.order._id)
          || orderState.quantityTodo === 0
          || orderState.startTimes.length === 0)
        {
          return;
        }

        orderState.timeDiff = activeFromTime - orderState.startTimes[0];

        bigOrderIdSet.add(orderState.order._id);
        bigOrderStateQueue.push(orderState);
      });

      bigOrderStateQueue.sort((a, b) => b.timeDiff - a.timeDiff);

      lineState.bigOrderStateQueue = bigOrderStateQueue;

      if (bigOrderStateQueue.length && bigOrderStateQueue[0].timeDiff > -20 * 60 * 1000)
      {
        return bigOrderStateQueue.shift();
      }
    }

    const firstPass = state.generateCallCount === 1;

    // Remaining orders but already started big ones
    while (lineState.orderStateQueue.length)
    {
      const orderState = lineState.orderStateQueue.shift();
      const {order} = orderState;

      if (lineState.plannedOrdersSet.has(order._id)
        || bigOrderIdSet.has(order._id)
        || isOrderPinnedToLine(orderState, lineState)
        || (firstPass && orderState.frozenOnLines.length && !orderState.frozenOnLines.includes(lineState._id)))
      {
        continue;
      }

      if (!timeForLateOrders && order.urgent && order.source === 'added')
      {
        lineState.skippedLateOrders.push(orderState);

        continue;
      }

      if (orderState.quantityTodo > 0)
      {
        return orderState;
      }
    }

    // Remaining big orders
    if (lineState.bigOrderStateQueue.length)
    {
      return lineState.bigOrderStateQueue.shift();
    }

    return null;
  }

  function isTimeForLateOrders(state, lineState)
  {
    if (state.generateCallCount > 1)
    {
      return true;
    }

    let activeFromHour = lineState.activeFrom.hours();

    if (activeFromHour < 6)
    {
      activeFromHour += 18;
    }
    else
    {
      activeFromHour -= 6;
    }

    return activeFromHour >= state.settings.lateHour;
  }

  function handleSmallOrder(state, lineState, orderState)
  {
    let candidate = trySmallOrder(state, lineState, orderState);

    if (!candidate)
    {
      return;
    }

    if (candidate.quantityRemaining > 0)
    {
      const candidates = [candidate];

      if (!LOG_LINES || LOG_LINES[lineState._id])
      {
        log(`        NOT PLANNED IN FULL: ${candidate.quantityRemaining} remaining`);
      }

      while (true) // eslint-disable-line no-constant-condition
      {
        const nextOrderState = getNextOrderForLine(state, lineState);

        if (!nextOrderState)
        {
          break;
        }

        if (!LOG_LINES || LOG_LINES[lineState._id])
        {
          log('        TRYING...');
        }

        const nextCandidate = handleOrderState(state, lineState, nextOrderState, true);

        if (nextCandidate)
        {
          candidates.push(nextCandidate);

          if (nextCandidate.completion === 1)
          {
            break;
          }
        }
      }

      candidates.sort((a, b) =>
      {
        const completion = b.completion - a.completion;

        return completion === 0 ? (b.duration - a.duration) : completion;
      });

      const bestCandidate = candidates[0];
      const completion = Math.ceil(bestCandidate.completion * 100);

      if (state.generateCallCount === 1)
      {
        if (completion < 80 && !bestCandidate.lastAvailableLine)
        {
          if (!LOG_LINES || LOG_LINES[lineState._id])
          {
            log(`        IGNORED ${completion}%: ${bestCandidate.orderState.order._id}`);
          }

          return;
        }

        if (bestCandidate.totalQuantityPlanned === 1)
        {
          if (!LOG_LINES || LOG_LINES[lineState._id])
          {
            log(`        IGNORED 1 PCE: ${bestCandidate.orderState.order._id}`);
          }

          return;
        }
      }

      if (!LOG_LINES || LOG_LINES[lineState._id])
      {
        log(`        BEST ${completion}%: ${bestCandidate.orderState.order._id}`);
      }

      candidate = bestCandidate;
    }

    mergeOrderCandidate(state, lineState, candidate);
  }

  function mergeOrderCandidate(state, lineState, candidate)
  {
    const plannedOrderState = candidate.orderState;
    const order = plannedOrderState.order;

    plannedOrderState.quantityTodo -= candidate.totalQuantityPlanned;

    plannedOrderState.startTimes.push(candidate.plannedOrders[0].startAt.getTime());

    plannedOrderState.startTimes.sort((a, b) => a - b);

    if (plannedOrderState.startTimes.length === 1 && plannedOrderState.quantityTodo > 0)
    {
      getLinesForBigOrder(state, order).forEach(availableLineState =>
      {
        if (availableLineState !== lineState)
        {
          lineState.bigOrderStateQueue.push(plannedOrderState);
        }
      });
    }

    candidate.plannedOrders.forEach(lineOrder =>
    {
      lineState.hash += lineOrder._id
        + 3
        + lineOrder.quantity
        + lineOrder.startAt.getTime()
        + lineOrder.finishAt.getTime();
    });

    lineState.completed = candidate.completed;
    lineState.shiftNo = candidate.shiftNo;
    lineState.activeFrom = moment.utc(_.last(candidate.plannedOrders).finishAt.getTime());
    lineState.nextDowntime = candidate.nextDowntime;
    lineState.plannedOrdersList = lineState.plannedOrdersList.concat(candidate.plannedOrders);
    lineState.downtimes = lineState.downtimes.concat(candidate.downtimes);

    candidate.hourlyPlan.forEach((v, k) => lineState.hourlyPlan[k] += v);

    order.incomplete = plannedOrderState.quantityTodo;

    if (order.incomplete)
    {
      state.newIncompleteOrders.set(order._id, order.incomplete);
    }
    else
    {
      state.newIncompleteOrders.delete(order._id);
    }

    lineState.plannedOrdersSet.add(order._id);

    if (!state.orderToLines.has(order._id))
    {
      state.orderToLines.set(order._id, new Set());
    }

    state.orderToLines.get(order._id).add(lineState);
  }

  function trySmallOrder(state, lineState, orderState, options)
  {
    const order = orderState.order;
    const orderNo = order._id;
    const lineId = lineState._id;
    const mrpId = order.mrp;

    const settings = state.settings;
    const mrpSettings = settings.mrp(mrpId);
    const mrpLineSettings = settings.mrpLine(mrpId, lineId);

    if (mrpLineSettings.workerCount === 0)
    {
      return null;
    }

    const lastAvailableLine = getLinesForBigOrder(state, order).length === 1;
    const pceTime = getPceTime(order, mrpLineSettings.workerCount, mrpSettings.schedulingRate);
    const activeTo = lineState.activeTo.valueOf();
    let startAt = lineState.activeFrom.valueOf();
    let finishAt = startAt + getOrderStartOverhead(state.settings, lineState, orderState);
    let totalQuantityPlanned = 0;
    let quantityPlanned = 0;
    let quantityRemaining = 0;
    let quantityTodo = orderState.quantityTodo;
    let maxQuantityPerLine = orderState.maxQuantityPerLine === 0 || lastAvailableLine
      ? orderState.quantityTodo
      : orderState.maxQuantityPerLine;
    let nextDowntime = lineState.nextDowntime;
    let shiftNo = lineState.shiftNo;
    let completed = false;
    let downtimes = [];
    let pceTimes = [];
    const plannedOrders = [];
    const hourlyPlan = EMPTY_HOURLY_PLAN.slice();

    if (options && options.continuation)
    {
      finishAt = startAt;
      maxQuantityPerLine = options.maxQuantityPerLine;
    }
    else if (state.generateCallCount === 1 && lineState.frozenOrdersMap.has(orderNo))
    {
      maxQuantityPerLine = lineState.frozenOrdersMap.get(orderNo);
    }

    if (!LOG_LINES || LOG_LINES[lineState._id])
    {
      log(
        `        ${orderNo} kind=${order.kind}`
        + ` workerCount=${mrpLineSettings.workerCount}`
        + ` laborTime=${order.operation.laborTime || '?'}`
        + ` manHours=${order.manHours}`
        + ` pceTime=${pceTime / 1000}`
        + ` maxPerLine=${maxQuantityPerLine}`
      );
      log(
        `                  activeFrom=${moment.utc(startAt).format('DD.MM HH:mm:ss')}`
        + ` activeTo=${moment.utc(activeTo).format('DD.MM HH:mm:ss')}`
      );
    }

    while (quantityPlanned <= quantityTodo)
    {
      let newFinishAt = finishAt + pceTime;
      let newNextDowntime = nextDowntime;
      const newDowntimes = [];

      while (newNextDowntime)
      {
        if (newNextDowntime.startTime <= newFinishAt)
        {
          if (newNextDowntime.startTime >= startAt)
          {
            newDowntimes.push({
              reason: newNextDowntime.reason,
              startAt: new Date(newNextDowntime.startTime),
              duration: newNextDowntime.duration
            });

            newFinishAt += newNextDowntime.duration;
          }

          newNextDowntime = newNextDowntime.next;

          continue;
        }

        break;
      }

      const newFinishMoment = moment.utc(newFinishAt);
      const h = newFinishMoment.hours();

      // End of 3rd shift
      if (newFinishAt > activeTo || (shiftNo === 3 && h >= 6 && h < 22))
      {
        if (quantityPlanned > 0)
        {
          quantityRemaining = quantityTodo - quantityPlanned;

          plannedOrders.push({
            _id: getNextLineOrderId(orderNo, shiftNo, lineState.plannedOrdersList, plannedOrders),
            orderNo: orderNo,
            quantity: quantityPlanned,
            pceTime,
            manHours: getManHours(order.operation, quantityPlanned, mrpSettings.schedulingRate),
            startAt: new Date(startAt),
            finishAt: new Date(finishAt),
            pceTimes
          });

          pceTimes = [];
        }

        completed = true;

        break;
      }

      // PCE crosses to 2nd or 3rd shift
      if ((shiftNo === 1 && h >= 14) || (shiftNo === 2 && (h >= 22 || h < 6)))
      {
        // First PCE crosses to 2nd or 3rd shift
        if (quantityPlanned === 0)
        {
          shiftNo += 1;
          startAt = settings.shiftStartTimes[shiftNo - 1];
          finishAt = startAt + mrpSettings.extraShiftSeconds[shiftNo - 1];
        }
        else
        {
          plannedOrders.push({
            _id: getNextLineOrderId(orderNo, shiftNo, lineState.plannedOrdersList, plannedOrders),
            orderNo,
            quantity: quantityPlanned,
            pceTime,
            manHours: getManHours(order.operation, quantityPlanned, mrpSettings.schedulingRate),
            startAt: new Date(startAt),
            finishAt: new Date(finishAt),
            pceTimes
          });

          pceTimes = [];

          if (quantityTodo - quantityPlanned === 0)
          {
            break;
          }

          shiftNo += 1;
          startAt = settings.shiftStartTimes[shiftNo - 1];
          finishAt = startAt + mrpSettings.extraOrderSeconds;
          quantityTodo -= quantityPlanned;
          quantityPlanned = 0;
        }

        continue;
      }

      if (quantityPlanned === quantityTodo
        || (maxQuantityPerLine > 0 && totalQuantityPlanned === maxQuantityPerLine))
      {
        plannedOrders.push({
          _id: getNextLineOrderId(orderNo, shiftNo, lineState.plannedOrdersList, plannedOrders),
          orderNo: orderNo,
          quantity: quantityPlanned,
          pceTime: pceTime,
          manHours: getManHours(order.operation, quantityPlanned, mrpSettings.schedulingRate),
          startAt: new Date(startAt),
          finishAt: new Date(finishAt),
          pceTimes
        });

        pceTimes = [];

        break;
      }

      finishAt = newFinishAt;
      nextDowntime = newNextDowntime;
      quantityPlanned += 1;
      totalQuantityPlanned += 1;

      downtimes = downtimes.concat(newDowntimes);
      pceTimes.push(h, newFinishMoment.minutes());
      hourlyPlan[HOUR_TO_INDEX[h]] += 1;
    }

    if (plannedOrders.length === 0)
    {
      return null;
    }

    const totalQuantityToPlan = totalQuantityPlanned + quantityRemaining;
    const completion = totalQuantityPlanned / totalQuantityToPlan;
    const duration = _.last(plannedOrders).finishAt.getTime() - plannedOrders[0].startAt.getTime();

    if (!LOG_LINES || LOG_LINES[lineState._id])
    {
      plannedOrders.forEach((plannedOrder, i) =>
      {
        log(
          `                  ${i + 1}. done=${plannedOrder.quantity}`
          + ` startAt=${moment.utc(plannedOrder.startAt).format('DD.MM HH:mm:ss')}`
          + ` finishAt=${moment.utc(plannedOrder.finishAt).format('DD.MM HH:mm:ss')}`
          + ` duration=${(plannedOrder.finishAt - plannedOrder.startAt) / 1000}`
        );
      });

      log(
        `                  toPlan=${totalQuantityToPlan} planned=${totalQuantityPlanned}`
        + ` remaining=${quantityRemaining} completion=${Math.round(completion * 10) / 10}`
        + ` duration=${duration / 1000}s`
      );
    }

    return {
      orderState,
      plannedOrders,
      lastAvailableLine,
      totalQuantityPlanned,
      totalQuantityToPlan,
      quantityRemaining,
      maxQuantityPerLine,
      completed,
      shiftNo,
      nextDowntime,
      downtimes,
      hourlyPlan,
      completion,
      duration
    };
  }

  function handleBigOrder(state, lineState, orderState, trying)
  {
    const order = orderState.order;
    const {splitOrderQuantity, maxSplitLineCount} = state.settings.mrp(order.mrp);

    if (orderState.quantityTodo < splitOrderQuantity
      || (maxSplitLineCount && orderState.maxQuantityPerLine > 0))
    {
      return (trying ? trySmallOrder : handleSmallOrder)(state, lineState, orderState);
    }

    const availableLines = getLinesForBigOrder(state, order);
    const splitLineCount = maxSplitLineCount > 0 && maxSplitLineCount < availableLines.length
      ? maxSplitLineCount
      : availableLines.length;

    orderState.maxQuantityPerLine = splitLineCount === 0
      ? orderState.quantityTodo
      : Math.ceil(orderState.quantityTodo / splitLineCount);

    availableLines.forEach(availableLineState =>
    {
      if (availableLineState !== lineState)
      {
        availableLineState.bigOrderStateQueue.push(orderState);
      }
    });

    return (trying ? trySmallOrder : handleSmallOrder)(state, lineState, orderState);
  }

  function getLinesForBigOrder(state, order)
  {
    const mrpSettings = state.settings.mrp(order.mrp);

    return state.settings.mrp(order.mrp).lines
      .filter(mrpLineSettings =>
      {
        const lineState = state.lineStates.get(mrpLineSettings._id);

        if (!mrpLineSettings.workerCount
          || !mrpLineSettings.orderPriority.includes(order.kind)
          || lineState.completed)
        {
          return false;
        }

        const availableTime = getRemainingAvailableTime(lineState);
        const pceTime = getPceTime(order, mrpLineSettings.workerCount, mrpSettings.schedulingRate);

        return availableTime >= pceTime;
      })
      .map(line => state.lineStates.get(line._id));
  }

  function getNextLineOrderId(orderId, shiftNo, linePlannedOrders, newPlannedOrders)
  {
    return `${orderId}-${shiftNo}-${1 + linePlannedOrders.length + newPlannedOrders.length}`;
  }

  function getPceTime(order, workerCount, schedulingRate)
  {
    return order.operation.laborTime
      ? (Math.ceil(order.operation.laborTime / 100 / workerCount * 3600 * schedulingRate) * 1000)
      : 0;
  }

  function getManHours(operation, quantityTodo, schedulingRate)
  {
    return operation.laborTime
      ? (((operation.laborTime / 100 * quantityTodo) + operation.laborSetupTime) * schedulingRate)
      : 0;
  }

  function getOrderStartOverhead(settings, lineState, orderState)
  {
    const shiftStartTimes = settings.shiftStartTimes;
    const {extraOrderSeconds, extraShiftSeconds, schedulingRate} = settings.mrp(orderState.order.mrp);
    const hours = lineState.activeFrom.hours();
    const seconds = lineState.activeFrom.minutes() * 60;
    const laborSetupTime = orderState.order.operation.laborSetupTime * schedulingRate;
    let shiftStartTime = 0;
    let extraShiftStartTime = 0;

    if (hours === 6 && seconds < extraShiftSeconds[0])
    {
      shiftStartTime = shiftStartTimes[0];
      extraShiftStartTime = extraShiftSeconds[0] * 1000;
    }
    else if (hours === 14 && seconds < extraShiftSeconds[1])
    {
      shiftStartTime = shiftStartTimes[1];
      extraShiftStartTime = extraShiftSeconds[1] * 1000;
    }
    else if (hours === 22 && seconds < extraShiftSeconds[2])
    {
      shiftStartTime = shiftStartTimes[2];
      extraShiftStartTime = extraShiftSeconds[2] * 1000;
    }
    else
    {
      return (extraOrderSeconds * 1000) + laborSetupTime;
    }

    const orderStartAt = lineState.activeFrom.valueOf();
    const startDowntimeFinishAt = shiftStartTime + extraShiftStartTime;

    if (orderStartAt >= startDowntimeFinishAt)
    {
      return (extraOrderSeconds * 1000) + laborSetupTime;
    }

    return (extraShiftStartTime - (orderStartAt - shiftStartTime)) + laborSetupTime;
  }

  function recountHourlyPlan(planLine)
  {
    for (let i = 0; i < 24; ++i)
    {
      planLine.hourlyPlan[i] = 0;
    }

    planLine.orders.forEach(lineOrder =>
    {
      for (let i = 0; i < lineOrder.pceTimes.length; i += 2)
      {
        planLine.hourlyPlan[HOUR_TO_INDEX[lineOrder.pceTimes[i]]] += 1;
      }
    });
  }

  function resizeAndFillLines(state, done)
  {
    step(
      function()
      {
        resizeLinesMiddle(state, this.next());
      },
      function()
      {
        fillLines(state, this.next());
      },
      function()
      {
        resizeLinesEnd(state, this.next());
      },
      function(err, again) // eslint-disable-line handle-callback-err
      {
        if (again && !state.cancelled)
        {
          setImmediate(resizeAndFillLines, state, done);
        }
        else
        {
          setImmediate(done);
        }
      }
    );
  }

  function resizeLinesMiddle(state, done)
  {
    if (state.cancelled || !state.newIncompleteOrders.size)
    {
      return done();
    }

    log('Resizing in the middle...');

    const incompletePlannedOrders = [];

    state.newIncompleteOrders.forEach((incomplete, orderNo) =>
    {
      if (state.resizedOrders.has(orderNo))
      {
        return;
      }

      const order = state.orders.get(orderNo);
      const quantityTodo = getQuantityTodo(state, order);

      if (incomplete >= quantityTodo)
      {
        return;
      }

      const plannedLines = Array.from(state.orderToLines.get(orderNo));

      if (plannedLines.length === 1 && state.generateCallCount === 1)
      {
        const lastPlannedOrder = _.last(plannedLines[0].plannedOrdersList);

        if (lastPlannedOrder.orderNo === orderNo)
        {
          return;
        }
      }

      let startAt = Number.MAX_SAFE_INTEGER;

      const resizeablePlannedLines = plannedLines.filter(plannedLineState =>
      {
        if (plannedLineState.unresizablePlannedOrdersSet.has(orderNo))
        {
          return false;
        }

        const plannedOrder = plannedLineState.plannedOrdersList.find(o => o.orderNo === orderNo);

        if (plannedOrder.startAt < startAt)
        {
          startAt = plannedOrder.startAt.getTime();
        }

        return true;
      });

      if (!resizeablePlannedLines.length)
      {
        return;
      }

      incompletePlannedOrders.push({
        order,
        plannedLines: resizeablePlannedLines,
        startAt
      });
    });

    if (!incompletePlannedOrders.length)
    {
      log('...nothing to resize!');

      return setImmediate(done);
    }

    const usedLines = new Set();

    incompletePlannedOrders.sort((a, b) => a.startAt - b.startAt).forEach(d =>
    {
      if (d.plannedLines.some(l => usedLines.has(l._id)))
      {
        return;
      }

      d.plannedLines.forEach(l =>
      {
        state.hourlyPlanRecount.add(l._id);
        usedLines.add(l._id);
      });

      state.resizedOrders.add(d.order._id);

      resizeIncompletePlannedOrder(state, d.order, d.plannedLines);
    });

    setImmediate(done, null, usedLines);
  }

  function resizeLinesEnd(state, done)
  {
    if (state.cancelled || !state.newIncompleteOrders.size)
    {
      return done();
    }

    log('Resizing at the end...');

    const incompletePlannedOrders = [];

    state.newIncompleteOrders.forEach((incomplete, orderNo) =>
    {
      if (state.resizedOrders.has(orderNo))
      {
        return;
      }

      const plannedLines = state.orderToLines.get(orderNo);

      if (!plannedLines)
      {
        return;
      }

      const incompleteLines = [];

      plannedLines.forEach(lineState =>
      {
        const lastPlannedOrder = _.last(lineState.plannedOrdersList);

        if (lastPlannedOrder.orderNo === orderNo)
        {
          incompleteLines.push(lineState._id);
        }
      });

      if (incompleteLines.length)
      {
        incompletePlannedOrders.push({
          orderNo,
          incompleteLines
        });
      }
    });

    if (!incompletePlannedOrders.length)
    {
      log('...nothing to resize!');

      return setImmediate(done);
    }

    log(incompletePlannedOrders);

    setImmediate(done);
  }

  function resizeIncompletePlannedOrder(state, order, lineStates)
  {
    log(`        ${order._id}... incomplete=${state.newIncompleteOrders.get(order._id)}`);

    let minPceCount = Number.MAX_SAFE_INTEGER;

    lineStates.forEach(lineState =>
    {
      log(`               ${lineState._id}...`);

      const plannedLineOrders = lineState.plannedOrdersList;
      const plannedOrderIndex = _.findLastIndex(plannedLineOrders, o => o.orderNo === order._id);
      const plannedOrder = plannedLineOrders[plannedOrderIndex];
      const activeFromTime = plannedOrder.finishAt.getTime();

      lineState.completed = false;
      lineState.activeFrom = moment.utc(activeFromTime);
      lineState.shiftNo = getShiftFromMoment(lineState.activeFrom);

      plannedLineOrders.splice(plannedOrderIndex + 1).forEach(unplannedLineOrder =>
      {
        lineState.plannedOrdersSet.delete(unplannedLineOrder.orderNo);

        const oldIncompleteQuantity = state.newIncompleteOrders.get(unplannedLineOrder.orderNo) || 0;
        const newIncompleteQuantity = oldIncompleteQuantity + unplannedLineOrder.quantity;

        state.newIncompleteOrders.set(unplannedLineOrder.orderNo, newIncompleteQuantity);

        state.orderToLines.get(unplannedLineOrder.orderNo).delete(lineState);

        const unplannedOrderState = state.orderStates.get(unplannedLineOrder.orderNo);

        unplannedOrderState.order.incomplete = newIncompleteQuantity;
        unplannedOrderState.quantityTodo = newIncompleteQuantity;

        removeFirstItem(unplannedOrderState.startTimes, unplannedLineOrder.startAt.getTime());

        log(`                       removed: ${unplannedLineOrder.orderNo}`);
      });

      for (let i = lineState.downtimes.length - 1; i >= 0; --i)
      {
        const downtime = lineState.downtimes[i];

        if (downtime.startAt < activeFromTime)
        {
          lineState.downtimes.splice(i + 1);

          break;
        }

        lineState.nextDowntime = {
          reason: downtime.reason,
          startTime: downtime.startAt.getTime(),
          duration: downtime.duration,
          next: lineState.nextDowntime
        };
      }

      const availableTime = getRemainingAvailableTime(lineState);
      const pceTime = plannedOrder.pceTime;
      const maxPceCount = Math.floor(availableTime / pceTime);

      if (maxPceCount < minPceCount)
      {
        minPceCount = maxPceCount;
      }

      lineState.resize = {
        plannedOrderIndex,
        maxPceCount
      };
    });

    lineStates.sort((a, b) => a.resize.maxPceCount - b.resize.maxPceCount);

    while (lineStates.length)
    {
      const lineState = lineStates.shift();

      if (lineState.resize.maxPceCount === 0)
      {
        continue;
      }

      const orderState = state.orderStates.get(order._id);
      const options = {
        continuation: true,
        maxQuantityPerLine: Math.min(
          Math.ceil(orderState.quantityTodo / lineStates.length),
          lineState.resize.maxPceCount
        )
      };
      const candidate = trySmallOrder(state, lineState, orderState, options);

      if (candidate)
      {
        mergeOrderCandidate(state, lineState, candidate);

        const firstPart = lineState.plannedOrdersList[lineState.resize.plannedOrderIndex];
        const secondPart = lineState.plannedOrdersList[lineState.resize.plannedOrderIndex + 1];

        firstPart.finishAt = secondPart.finishAt;
        firstPart.quantity += secondPart.quantity;
        firstPart.manHours += secondPart.manHours;
        firstPart.pceTimes = firstPart.pceTimes.concat(secondPart.pceTimes);

        lineState.plannedOrdersList.splice(lineState.resize.plannedOrderIndex + 1, 1);
      }

      completeLine(state, lineState);
    }
  }

  function fillLines(state, done)
  {
    if (state.cancelled || !state.newIncompleteOrders.size)
    {
      return done();
    }

    log('Filling...');

    const incompleteMrps = new Map();
    const checkedMrps = new Set();

    state.newIncompleteOrders.forEach((incomplete, orderNo) =>
    {
      if (incomplete <= 0)
      {
        return;
      }

      const {ignored, mrp, operation} = state.orders.get(orderNo);

      if (ignored || !operation.laborTime)
      {
        return;
      }

      if (checkedMrps.has(mrp))
      {
        if (incompleteMrps.has(mrp))
        {
          incompleteMrps.get(mrp).push(orderNo);
        }

        return;
      }

      if (hasAnyLineWithRoomForOrder(state, orderNo))
      {
        incompleteMrps.set(mrp, [orderNo]);
      }

      checkedMrps.add(mrp);
    });

    if (!incompleteMrps.size)
    {
      log('...nothing to fill!');

      return setImmediate(done, null, false);
    }

    const steps = [];

    incompleteMrps.forEach((orderNos, mrp) =>
    {
      steps.push(function()
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        fillMrpLines(state, mrp, orderNos, this.next());
      });
    });

    steps.push(function() { generatePlanForLines(1, state, this.next()); });
    steps.push(done.bind(null, null, true));

    step(steps);
  }

  function fillMrpLines(state, mrp, orderNos, done)
  {
    log(`        ${mrp}...`);
    log(`             Orders: ${orderNos.join(', ')}`);

    const lineStatesToFill = [];

    state.settings.mrp(mrp).lines.forEach(mrpLineSettings =>
    {
      const lineState = state.lineStates.get(mrpLineSettings._id);

      lineState.orderStateQueue = [];

      orderNos.forEach(orderNo =>
      {
        const orderState = state.orderStates.get(orderNo);

        if (mrpLineSettings.orderPriority.includes(orderState.order.kind))
        {
          orderState.lines = [];
          orderState.maxQuantityPerLine = 0;

          lineState.orderStateQueue.push(orderState);
        }
      });

      lineState.orderStateQueue.sort((a, b) =>
      {
        const aStartTime = a.startTimes[0] || Number.MAX_SAFE_INTEGER;
        const bStartTime = b.startTimes[0] || Number.MAX_SAFE_INTEGER;

        return aStartTime === bStartTime
          ? (a.quantityTodo - b.quantityTodo)
          : (aStartTime - bStartTime);
      });

      if (lineState.orderStateQueue.length)
      {
        lineState.completed = false;

        lineStatesToFill.push(lineState);
      }
    });

    if (!lineStatesToFill.length)
    {
      return setImmediate(done);
    }

    lineStatesToFill.sort((a, b) => a.activeFrom.valueOf() - b.activeFrom.valueOf());

    log(`             Lines: ${lineStatesToFill.map(l => l._id).join(', ')}`);

    state.lineStateQueue = state.lineStateQueue.concat(lineStatesToFill);

    return setImmediate(done);
  }

  function hasAnyLineWithRoomForOrder(state, orderNo)
  {
    const order = state.orders.get(orderNo);
    const mrpSettings = state.settings.mrp(order.mrp);

    return mrpSettings.lines.some(mrpLineSettings =>
    {
      if (mrpLineSettings.workerCount === 0 || !mrpLineSettings.orderPriority.includes(order.kind))
      {
        return false;
      }

      const lineState = state.lineStates.get(mrpLineSettings._id);
      const availableTime = getRemainingAvailableTime(lineState);
      const pceTime = getPceTime(order, mrpLineSettings.workerCount, mrpSettings.schedulingRate);

      return !lineState.plannedOrdersSet.has(order._id) && availableTime >= pceTime;
    });
  }

  function getRemainingAvailableTime(lineState)
  {
    const activeTo = lineState.activeTo.valueOf();

    let remaining = activeTo - lineState.activeFrom.valueOf();
    let nextDowntime = lineState.nextDowntime;

    while (nextDowntime && nextDowntime.startTime < activeTo)
    {
      remaining -= nextDowntime.duration;
      nextDowntime = nextDowntime.next;
    }

    return remaining;
  }

  function removeFirstItem(array, itemToRemove)
  {
    const i = array.indexOf(itemToRemove);

    if (i !== -1)
    {
      array.splice(i, 1);
    }
  }
};
