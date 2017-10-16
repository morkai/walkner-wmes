// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const deepEqual = require('deep-equal');
const setUpAutoDowntimeCache = require('./autoDowntimeCache');

const ORDER_IGNORED_PROPERTIES = {
  incomplete: true
};
const ORDER_USER_PROPERTIES = [
  'quantityPlan',
  'added',
  'ignored',
  'urgent'
];
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
  if (!module.config.generator)
  {
    return;
  }

  const log = app.options.env === 'development'
    ? m => console.log(m)
    : () => {};

  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  const autoDowntimeCache = setUpAutoDowntimeCache(app, module);
  const generatorQueue = [];
  let generatorTimer = null;
  let generatorState = null;

  app.broker.subscribe('app.started').setLimit(1).on('message', () =>
  {
    if (app.options.env === 'development')
    {
      const m = moment();

      if (m.hours() < 6)
      {
        m.subtract(1, 'days');
      }

      generatePlan(m.startOf('day').add(1, 'days').format('YYYY-MM-DD'));
    }
    else
    {
      generateActivePlans(false);
    }
  });

  app.broker.subscribe('planning.generator.requested', handleRequest);

  function handleRequest(message)
  {
    if (message.reloadAutoDowntimes)
    {
      autoDowntimeCache.clear();
    }

    if (!message.date)
    {
      generateActivePlans(message.forceDayAfterTomorrow === true);
    }
    else
    {
      generatePlan(message.date);
    }
  }

  function createPlanGeneratorState(key)
  {
    return {
      key: key,
      date: moment.utc(key, 'YYYY-MM-DD').toDate(),
      cancelled: false,
      settings: null,
      autoDowntimes: null,
      orders: null,
      plan: null,
      orderStateQueues: null,
      lineStates: null,
      lineStateQueue: [],
      oldIncompleteOrders: new Map(),
      newIncompleteOrders: new Map(),
      incompleteOrders: new Map(),
      changes: {
        addedOrders: new Map(),
        removedOrders: new Map(),
        changedOrders: new Map(),
        changedLines: new Map()
      },
      log: message => module.debug(`[generator] [${key}] ${message}`)
    };
  }

  function generateActivePlans(forceDayAfterTomorrow)
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

      if (h < 5 || (h === 5 && m < 55))
      {
        // Today
        plansToGenerate[now.format('YYYY-MM-DD')] = true;
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

          if (generatorState.cancelled)
          {
            generatorQueue.push(planKey);
          }

          if (nextPlan)
          {
            generatorQueue.push(moment.utc(nextPlan._id).format('YYYY-MM-DD'));
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

        if (state.date <= currentDay.toDate())
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

        loadOrders(state, null, this.next());
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
      function generatePlanStep(err)
      {
        if (state.cancelled)
        {
          return this.skip();
        }

        if (err)
        {
          return this.skip(new Error(`Failed to load orders: ${err.message}`));
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
    let anyChanges = false;

    Object.keys(state.changes).forEach(key =>
    {
      anyChanges = anyChanges || state.changes[key].size > 0;
    });

    if (!anyChanges)
    {
      return;
    }

    const data = {};

    Object.keys(state.changes).forEach(key =>
    {
      if (state.changes[key].size)
      {
        data[key] = Array.from(state.changes[key].values());
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
        app.broker.publish('planning.changes.created', planChange.toCreatedMessage(state.plan));
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
      done
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

  function loadOrders(state, ids, done)
  {
    state.log(`Loading ${ids ? 'additional orders' : 'orders'}...`);

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
          const hardComponents = state.settings.mrp(sapOrder.mrp).hardComponents;
          const planOrder = Plan.createPlanOrder(sapOrder, hardComponents);

          state.orders.set(sapOrder._id, planOrder);
        });

        setImmediate(this.next());
      },
      done
    );
  }

  function preparePlanOrder(state, planOrder)
  {
    if (state.incompleteOrders.has(planOrder._id))
    {
      planOrder.urgent = true;
      planOrder.quantityPlan = state.incompleteOrders.get(planOrder._id);
    }

    const operation = planOrder.operation;
    const quantityTodo = getQuantityTodo(state, planOrder);

    if (operation)
    {
      const manHours = (operation.laborTime / 100 * quantityTodo) + operation.laborSetupTime;

      planOrder.manHours = Math.round(manHours * 1000) / 1000;
    }

    planOrder.kind = classifyPlanOrder(state, planOrder);
    planOrder.incomplete = quantityTodo;

    state.newIncompleteOrders.set(planOrder._id, quantityTodo);

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

        state.plan = existingPlan || new Plan({
          _id: state.date,
          createdAt: new Date(),
          updatedAt: null,
          orders: [],
          lines: []
        });

        if (state.plan.frozen)
        {
          return this.skip(new Error('Plan is frozen.'));
        }

        setImmediate(this.next());
      },
      function loadAddedOrdersStep()
      {
        if (state.plan.isNew)
        {
          return;
        }

        const addedOrders = [];

        state.plan.orders.forEach(planOrder =>
        {
          if (planOrder.added && !state.orders.has(planOrder._id))
          {
            addedOrders.push(planOrder._id);
          }
        });

        if (addedOrders.length)
        {
          loadOrders(state, addedOrders, this.next());
        }
      },
      function loadIncompleteOrdersStep()
      {
        loadIncompleteOrders(state, this.next());
      },
      function compareOrdersStep()
      {
        if (state.plan.isNew)
        {
          state.plan.orders = Array.from(state.orders.values())
            .filter(order => filterPlanOrder(state, order) === null)
            .map(order => preparePlanOrder(state, order));

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

  function loadIncompleteOrders(state, done)
  {
    step(
      function()
      {
        const prevPlanId = moment.utc(state.date.getTime()).subtract(1, 'days').toDate();
        const pipeline = [
          {$match: {_id: prevPlanId}},
          {$unwind: '$orders'},
          {$match: {'orders.incomplete': {$gt: 0}}},
          {$project: {_id: '$orders._id', incomplete: '$orders.incomplete'}}
        ];

        Plan.aggregate(pipeline, this.next());
      },
      function(err, incompleteOrders)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find incomplete orders: ${err.message}`));
        }

        incompleteOrders.forEach(order =>
        {
          state.incompleteOrders.set(order._id, order.incomplete);
        });

        loadOrders(state, Array.from(state.incompleteOrders.keys()), this.next());
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
    const actualStatuses = new Set();

    for (let i = 0; i < planOrder.statuses.length; ++i)
    {
      const actualStatus = planOrder.statuses[i];

      if (state.settings.ignoredStatuses.has(actualStatus))
      {
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

    return quantityTodo < bigOrderQuantity;
  }

  function isHardOrder(state, planOrder)
  {
    // Has a hard component
    if (planOrder.hardComponent !== null)
    {
      return true;
    }

    const operation = planOrder.operation;

    if (!operation)
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
      if (filterPlanOrder(state, latestOrder) === null)
      {
        preparePlanOrder(state, latestOrder);

        newPlanOrders.push(latestOrder);

        state.changes.addedOrders.set(latestOrder._id, latestOrder);
      }
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

    preparePlanOrder(state, latestOrder);

    const changes = {};
    let changed = false;

    Object.keys(latestOrder).forEach(key =>
    {
      if (ORDER_IGNORED_PROPERTIES[key])
      {
        return;
      }

      const oldValue = oldOrder[key] && oldOrder[key].toObject ? oldOrder[key].toObject() : oldOrder[key];
      const newValue = latestOrder[key];

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

        generatePlanForLines(state, this.next());
      },
      done
    );
  }

  function createOrderStateQueues(state, done)
  {
    state.orderStateQueues = new Map();

    state.plan.orders.forEach(planOrder =>
    {
      if (planOrder.ignored)
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
        quantityTodo: getQuantityTodo(state, planOrder),
        maxQuantityPerLine: 0,
        firstStartAt: 0
      };

      if (planOrder.urgent)
      {
        orderStateQueue.urgent.push(orderState);
      }
      else
      {
        orderStateQueue[planOrder.kind].push(orderState);
      }
    });

    for (const orderStateQueues of state.orderStateQueues.values())
    {
      orderStateQueues.urgent.sort(sortUrgentOrders);
      orderStateQueues.small.sort(sortEasyOrders);
      orderStateQueues.easy.sort(sortEasyOrders);
      orderStateQueues.hard.sort(sortHardOrders);
    }

    setImmediate(done);
  }

  function sortUrgentOrders(a, b)
  {
    if (a.order.quantityDone > 0 && b.order.quantityDone === 0)
    {
      return -1;
    }

    if (b.order.quantityDone > 0 && a.order.quantityDone === 0)
    {
      return 1;
    }

    return a.quantityTodo - b.quantityTodo;
  }

  function sortEasyOrders(a, b)
  {
    return b.order.manHours - a.order.manHours;
  }

  function sortHardOrders(a, b)
  {
    if (a.order.hardComponent !== null && b.order.hardComponent !== null)
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
      const lineState = {
        _id: lineId,
        completed: false,
        shiftNo: -1,
        activeFrom: createMomentFromActiveTime(state.date.getTime(), lineSettings.activeFrom, true),
        activeTo: createMomentFromActiveTime(state.date.getTime(), lineSettings.activeTo, false),
        nextDowntime: state.autoDowntimes.get(lineId),
        downtimes: [],
        orderStateQueue: createLineOrderStateQueue(state, lineId, lineSettings.mrpPriority),
        bigOrderStateQueue: [],
        plannedOrdersSet: new Set(),
        plannedOrdersList: [],
        pceTimes: [],
        hourlyPlan: EMPTY_HOURLY_PLAN.slice(),
        hash: createHash('md5')
      };

      lineState.shiftNo = getShiftFromMoment(lineState.activeFrom);

      state.lineStates.set(lineId, lineState);

      state.lineStateQueue.push(lineState);
    });

    setImmediate(done);
  }

  function createLineOrderStateQueue(state, lineId, mrpPriority)
  {
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
          lineOrderStateQueue.push(orderState);
        }
      });

      mrpLineSettings.orderPriority.forEach(orderPriority =>
      {
        lineOrderStateQueue = lineOrderStateQueue.concat(mrpOrderStateQueue[orderPriority]);
      });
    });

    return lineOrderStateQueue;
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

  function generatePlanForLines(state, done)
  {
    if (state.cancelled || !state.lineStateQueue.length)
    {
      return done();
    }

    generatePlanForLine(state, state.lineStateQueue.shift(), () => generatePlanForLines(state, done));
  }

  function generatePlanForLine(state, lineState, done)
  {
    state.log(`[${lineState._id}] Generating...`);

    while (!lineState.completed)
    {
      const orderState = getNextOrderForLine(lineState);

      if (!orderState)
      {
        break;
      }

      if (orderState.order.kind === 'small')
      {
        handleSmallOrder(state, lineState, orderState);
      }
      else
      {
        handleBigOrder(state, lineState, orderState);
      }
    }

    setImmediate(completeLine, state, lineState, done);
  }

  function completeLine(state, lineState, done)
  {
    lineState.completed = true;

    const oldPlanLine = state.plan.lines.find(planLine => planLine._id === lineState._id);
    const newPlanLine = {
      _id: lineState._id,
      version: 1,
      hash: lineState.hash.digest('hex'),
      orders: lineState.plannedOrdersList,
      downtimes: lineState.downtimes,
      totalQuantity: lineState.pceTimes.length / 2,
      hourlyPlan: lineState.hourlyPlan,
      pceTimes: lineState.pceTimes
    };

    if (!oldPlanLine)
    {
      state.plan.lines.push(newPlanLine);

      state.changes.changedLines.set(newPlanLine._id, {
        _id: newPlanLine._id,
        version: newPlanLine.version
      });

      log('        Completed: pushed new line!');
    }
    else if (oldPlanLine.hash !== newPlanLine.hash)
    {
      newPlanLine.version = oldPlanLine.version + 1;

      Object.assign(oldPlanLine, newPlanLine);

      state.changes.changedLines.set(oldPlanLine._id, {
        _id: oldPlanLine._id,
        version: oldPlanLine.version
      });

      log(`        Completed: changed existing line. New version: ${oldPlanLine.version}`);
    }
    else
    {
      log('        Completed: no changes!');
    }

    setImmediate(done);
  }

  function getNextOrderForLine(lineState)
  {
    const bigOrderIdSet = new Set();

    if (lineState.bigOrderStateQueue.length)
    {
      const activeFromTime = lineState.activeFrom.valueOf();
      const bigOrderStateQueue = [];

      lineState.bigOrderStateQueue.forEach(orderState =>
      {
        if (lineState.plannedOrdersSet.has(orderState.order._id)
          || orderState.quantityTodo === 0)
        {
          return;
        }

        orderState.timeDiff = activeFromTime - orderState.firstStartAt;

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

    while (lineState.orderStateQueue.length)
    {
      const orderState = lineState.orderStateQueue.shift();

      if (lineState.plannedOrdersSet.has(orderState.order._id)
        || bigOrderIdSet.has(orderState.order._id))
      {
        continue;
      }

      if (orderState.quantityTodo > 0)
      {
        return orderState;
      }
    }

    if (lineState.bigOrderStateQueue.length)
    {
      return lineState.bigOrderStateQueue.shift();
    }

    return null;
  }

  function handleSmallOrder(state, lineState, orderState)
  {
    const order = orderState.order;
    const orderId = order._id;
    const lineId = lineState._id;
    const mrpId = order.mrp;

    const settings = state.settings;
    const mrpSettings = state.settings.mrp(mrpId);
    const mrpLineSettings = state.settings.mrpLine(mrpId, lineId);

    const maxQuantityPerLine = orderState.maxQuantityPerLine || 0;
    const pceTime = getPceTime(order, mrpLineSettings.workerCount);
    const activeTo = lineState.activeTo.valueOf();
    let startAt = lineState.activeFrom.valueOf();
    let finishAt = startAt + getOrderStartOverhead(state.settings, lineState, orderState);
    let totalQuantityPlanned = 0;
    let quantityPlanned = 0;
    let quantityRemaining = 0;
    let quantityTodo = orderState.quantityTodo;
    let nextDowntime = lineState.nextDowntime;
    let shiftNo = lineState.shiftNo;
    let completed = false;
    let downtimes = [];
    const plannedOrders = [];
    const pceTimes = [];
    const hourlyPlan = EMPTY_HOURLY_PLAN.slice();

    log(
      `        ${orderId} kind=${order.kind}`
      + ` workerCount=${mrpLineSettings.workerCount}`
      + ` laborTime=${order.operation.laborTime}`
      + ` manHours=${order.manHours}`
      + ` pceTime=${pceTime / 1000}`
    );
    log(
      `                  activeFrom=${moment.utc(startAt).format('DD.MM HH:mm:ss')}`
      + ` activeTo=${moment.utc(activeTo).format('DD.MM HH:mm:ss')}`
    );

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
            _id: getNextLineOrderId(orderId, shiftNo, lineState.plannedOrdersList, plannedOrders),
            orderNo: orderId,
            quantity: quantityPlanned,
            pceTime: pceTime,
            startAt: new Date(startAt),
            finishAt: new Date(finishAt)
          });
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
            _id: getNextLineOrderId(orderId, shiftNo, lineState.plannedOrdersList, plannedOrders),
            orderNo: orderId,
            quantity: quantityPlanned,
            pceTime: pceTime,
            startAt: new Date(startAt),
            finishAt: new Date(finishAt)
          });

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
          _id: getNextLineOrderId(orderId, shiftNo, lineState.plannedOrdersList, plannedOrders),
          orderNo: orderId,
          quantity: quantityPlanned,
          pceTime: pceTime,
          startAt: new Date(startAt),
          finishAt: new Date(finishAt)
        });

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

    if (!plannedOrders.length)
    {
      return;
    }

    const initialQuantityTodo = orderState.quantityTodo;

    orderState.quantityTodo -= totalQuantityPlanned;

    if (orderState.firstStartAt === 0)
    {
      orderState.firstStartAt = plannedOrders[0].startAt.getTime();

      if (orderState.quantityTodo > 0)
      {
        getLinesForBigOrder(state, order.mrp, order.kind).forEach(availableLineState =>
        {
          if (availableLineState !== lineState)
          {
            lineState.bigOrderStateQueue.push(orderState);
          }
        });
      }
    }

    plannedOrders.forEach(lineOrder =>
    {
      lineState.hash.update(
        lineOrder._id
        + lineOrder.quantity
        + lineOrder.pceTime
        + lineOrder.startAt.getTime()
        + lineOrder.finishAt.getTime()
      );
    });

    lineState.completed = completed;
    lineState.shiftNo = shiftNo;
    lineState.activeFrom = moment.utc(_.last(plannedOrders).finishAt.getTime());
    lineState.nextDowntime = nextDowntime;
    lineState.plannedOrdersList = lineState.plannedOrdersList.concat(plannedOrders);
    lineState.downtimes = lineState.downtimes.concat(downtimes);
    lineState.pceTimes = lineState.pceTimes.concat(pceTimes);

    hourlyPlan.forEach((v, k) => lineState.hourlyPlan[k] += v);

    order.incomplete = orderState.quantityTodo;

    if (order.incomplete)
    {
      state.newIncompleteOrders.set(orderId, order.incomplete);
    }
    else
    {
      state.newIncompleteOrders.delete(orderId);
    }

    lineState.plannedOrdersSet.add(orderId);

    log(
      `                  todo=${initialQuantityTodo}`
      + ` maxPerLine=${maxQuantityPerLine}`
      + ` done=${initialQuantityTodo - quantityRemaining}`
      + ` remaining=${quantityRemaining}`
    );
    plannedOrders.forEach(plannedOrder =>
    {
      log(
        `                  done=${plannedOrder.quantity}`
        + ` startAt=${moment.utc(plannedOrder.startAt).format('DD.MM HH:mm:ss')}`
        + ` finishAt=${moment.utc(plannedOrder.finishAt).format('DD.MM HH:mm:ss')}`
        + ` duration=${(plannedOrder.finishAt - plannedOrder.startAt) / 1000}`
      );
    });
  }

  function handleBigOrder(state, lineState, orderState)
  {
    const order = orderState.order;
    const {splitOrderQuantity, maxSplitLineCount} = state.settings.mrp(order.mrp);

    if (orderState.quantityTodo < splitOrderQuantity
      || (maxSplitLineCount && orderState.maxQuantityPerLine > 0))
    {
      return handleSmallOrder(state, lineState, orderState);
    }

    const availableLines = getLinesForBigOrder(state, order.mrp, order.kind);
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

    handleSmallOrder(state, lineState, orderState);
  }

  function getLinesForBigOrder(state, orderMrp, orderKind)
  {
    return state.settings.mrp(orderMrp).lines
      .filter(line => line.orderPriority.includes(orderKind) && !state.lineStates.get(line._id).completed)
      .map(line => state.lineStates.get(line._id));
  }

  function getNextLineOrderId(orderId, shiftNo, linePlannedOrders, newPlannedOrders)
  {
    return `${orderId}-${shiftNo}-${1 + linePlannedOrders.length + newPlannedOrders.length}`;
  }

  function getPceTime(order, workerCount)
  {
    return Math.ceil(order.operation.laborTime / 100 / workerCount * 3600) * 1000;
  }

  function getOrderStartOverhead(settings, lineState, orderState)
  {
    const shiftStartTimes = settings.shiftStartTimes;
    const {extraOrderSeconds, extraShiftSeconds} = settings.mrp(orderState.order.mrp);
    const hours = lineState.activeFrom.hours();
    const seconds = lineState.activeFrom.minutes() * 60;
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
      return extraOrderSeconds * 1000;
    }

    const orderStartAt = lineState.activeFrom.valueOf();
    const startDowntimeFinishAt = shiftStartTime + extraShiftStartTime;

    if (orderStartAt >= startDowntimeFinishAt)
    {
      return extraOrderSeconds * 1000;
    }

    return extraShiftStartTime - (orderStartAt - shiftStartTime);
  }
};
