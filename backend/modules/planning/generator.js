// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const deepEqual = require('deep-equal');
const resolveProductName = require('../util/resolveProductName');
const resolveBestOperation = require('../util/resolveBestOperation');
const setUpAutoDowntimeCache = require('./autoDowntimeCache');

const ORDER_USER_PROPERTIES = [
  'quantityPlan',
  'added',
  'ignored'
];
const OPERATION_PROPERTIES = [
  'item',
  'name',
  'machineSetupTime',
  'laborSetupTime',
  'machineTime',
  'laborTime'
];

module.exports = function setUpGenerator(app, module)
{
  if (!module.config.generator)
  {
    return;
  }

  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');
  const PlanChange = mongoose.model('PlanChange');

  const autoDowntimeCache = setUpAutoDowntimeCache(app, module);
  const inProgressState = new Map();

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

  function createPlanGeneratorState(key, date, reload, done)
  {
    const state = {
      key: key,
      date: date,
      doneCallbacks: [],
      cancelled: false,
      settings: null,
      autoDowntimes: null,
      orders: null,
      plan: null,
      orderStateQueues: null,
      lineStateQueue: [],
      changes: {
        addedOrders: [],
        removedOrders: [],
        changedOrders: []
      },
      log: message => module.debug(`[generator] [${key}] ${message}`)
    };

    if (typeof done === 'function')
    {
      state.doneCallbacks.push(done);
    }

    inProgressState.set(key, state);

    return state;
  }

  function cancelGeneratePlan(state, done)
  {
    state.cancelled = true;
    state.settings = null;
    state.autoDowntimes = null;
    state.orders = null;
    state.plan = null;
    state.orderStateQueues = null;
    state.lineStateQueue = [];
    state.changes = {
      addedOrders: [],
      removedOrders: [],
      changedOrders: []
    };

    if (typeof done === 'function')
    {
      state.doneCallbacks.push(done);
    }
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
      const h = now.hours();
      const m = now.minutes();

      if (h < 5 || (h === 5 && m < 55))
      {
        // Today
        plansToGenerate[date.format('YYYY-MM-DD')] = true;
      }

      // Tomorrow
      plansToGenerate[date.add(1, 'day').format('YYYY-MM-DD')] = true;

      if (forceDayAfterTomorrow || h > 17)
      {
        // Day after tomorrow
        plansToGenerate[date.add(1, 'day').format('YYYY-MM-DD')] = true;
      }

      // Any additional plans
      plans.forEach(plan => plansToGenerate[moment.utc(plan._id).format('YYYY-MM-DD')] = true);

      Object.keys(plansToGenerate).forEach(date => generatePlan(date));
    });
  }

  function generatePlan(date, done)
  {
    const dateMoment = moment.utc(date, 'YYYY-MM-DD').startOf('day');

    if (!dateMoment.isValid())
    {
      return done(app.createError('INVALID_DATE', 400));
    }

    const planKey = dateMoment.format('YYYY-MM-DD');
    const state = inProgressState.get(planKey);

    if (state)
    {
      module.debug(`[generator] [${state.key}] Cancelling...`);

      return cancelGeneratePlan(state, done);
    }

    app.broker.publish('planning.generator.started', {
      date: planKey
    });

    tryGeneratePlan(createPlanGeneratorState(planKey, dateMoment.toDate(), done));
  }

  function tryGeneratePlan(state)
  {
    const startedAt = Date.now();

    module.debug(`[generator] [${state.key}] Started...`);

    step(
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

          state.cancelled = false;

          return setImmediate(tryGeneratePlan, state);
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

        state.doneCallbacks.forEach(done => done(err));

        inProgressState.delete(state.key);

        app.broker.publish('planning.generator.finished', {
          date: state.key
        });
      }
    );
  }

  function savePlanChanges(state)
  {
    let anyChanges = false;

    Object.keys(state.changes).forEach(key =>
    {
      anyChanges = anyChanges || !_.isEmpty(state.changes[key]);
    });

    if (!anyChanges)
    {
      return;
    }

    const planChange = new PlanChange({
      plan: state.plan._id,
      date: state.plan.updatedAt,
      user: null,
      data: state.changes
    });

    planChange.save(err =>
    {
      if (err)
      {
        module.error(`[generator] [${state.key}] Failed to save changes: ${err.message}`);
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
        const projection = {
          mrp: 1,
          nc12: 1,
          name: 1,
          description: 1,
          qty: 1,
          'qtyDone.total': 1,
          statuses: 1,
          operations: 1
        };

        if (state.settings.hardComponents.length)
        {
          projection.bom = {
            $elemMatch: {
              nc12: {$in: state.settings.hardComponents}
            }
          };
        }

        Order
          .find(conditions, projection)
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
          state.orders.set(sapOrder._id, createPlanOrder(sapOrder));
        });

        setImmediate(this.next());
      },
      done
    );
  }

  function createPlanOrder(sapOrder)
  {
    return {
      _id: sapOrder._id,
      kind: 'unclassified',
      mrp: sapOrder.mrp,
      nc12: sapOrder.nc12,
      name: resolveProductName(sapOrder),
      statuses: sapOrder.statuses,
      operation: _.pick(resolveBestOperation(sapOrder.operations), OPERATION_PROPERTIES),
      manHours: 0,
      hardComponents: Array.isArray(sapOrder.bom) && sapOrder.bom.length > 0,
      quantityTodo: sapOrder.qty,
      quantityDone: (sapOrder.qtyDone && sapOrder.qtyDone.total) || 0,
      quantityPlan: 0,
      added: false,
      ignored: false
    };
  }

  function preparePlanOrder(planOrder, settings)
  {
    const operation = planOrder.operation;

    if (operation)
    {
      const quantityTodo = getQuantityTodo(planOrder, settings);
      const manHours = operation.laborTime / 100 * quantityTodo + operation.laborSetupTime;

      planOrder.manHours = Math.round(manHours * 1000) / 1000;
    }

    planOrder.kind = classifyPlanOrder(planOrder, settings);

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

        state.plan = existingPlan || new Plan({
          _id: state.date,
          createdAt: new Date(),
          updatedAt: null,
          orders: [],
          lines: []
        });

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
      function compareOrdersStep()
      {
        if (state.plan.isNew)
        {
          state.plan.orders = Array.from(state.orders.values())
            .filter(order => filterPlanOrder(order, state.settings) === null)
            .map(order => preparePlanOrder(order, state.settings));

          state.changes.addedOrders = [].concat(state.plan.orders);

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

  function filterPlanOrder(planOrder, settings)
  {
    const actualStatuses = new Set();

    for (let i = 0; i < planOrder.statuses.length; ++i)
    {
      const actualStatus = planOrder.statuses[i];

      if (settings.ignoredStatuses.has(actualStatus))
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

    for (let i = 0; i < settings.requiredStatuses.length; ++i)
    {
      const requiredStatus = settings.requiredStatuses[i];

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

  function classifyPlanOrder(planOrder, settings)
  {
    if (isSmallOrder(planOrder, settings))
    {
      return 'small';
    }

    if (isHardOrder(planOrder, settings))
    {
      return 'hard';
    }

    return 'easy';
  }

  function getQuantityTodo(planOrder, settings)
  {
    if (planOrder.quantityPlan > 0)
    {
      return planOrder.quantityPlan;
    }

    if (settings.useRemainingQuantity)
    {
      return Math.max(planOrder.quantityTodo - planOrder.quantityDone, 0);
    }

    return planOrder.quantityTodo;
  }

  function isSmallOrder(planOrder, settings)
  {
    const quantityTodo = getQuantityTodo(planOrder, settings);
    const bigOrderQuantity = settings.mrp(planOrder.mrp).bigOrderQuantity;

    return quantityTodo < bigOrderQuantity;
  }

  function isHardOrder(planOrder, settings)
  {
    // Has a hard component
    if (planOrder.hardComponents)
    {
      return true;
    }

    const operation = planOrder.operation;

    if (!operation)
    {
      return false;
    }

    const hardOrderManHours = settings.mrp(planOrder.mrp).hardOrderManHours;

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
        state.changes.removedOrders.push({
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
      if (filterPlanOrder(latestOrder, state.settings) === null)
      {
        preparePlanOrder(latestOrder, state.settings);

        newPlanOrders.push(latestOrder);

        state.changes.addedOrders.push(latestOrder);
      }
    });

    state.plan.orders = newPlanOrders;

    const added = state.changes.addedOrders.length;
    const changed = state.changes.changedOrders.length;
    const removed = state.changes.removedOrders.length;

    state.log(`Added ${added}, changed ${changed} and removed ${removed} orders!`);

    setImmediate(done);
  }

  function compareOrder(state, oldOrder, latestOrder)
  {
    Object.assign(latestOrder, _.pick(oldOrder, ORDER_USER_PROPERTIES));

    const removedOrder = filterPlanOrder(latestOrder, state.settings);

    if (removedOrder !== null)
    {
      state.changes.removedOrders.push(removedOrder);

      return false;
    }

    preparePlanOrder(latestOrder, state.settings);

    const changes = {};
    let changed = false;

    Object.keys(latestOrder).forEach(key =>
    {
      const oldValue = oldOrder[key].toObject ? oldOrder[key].toObject() : oldOrder[key];
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
      state.changes.changedOrders.push({
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
        createOrderQueues(state, this.next());
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

  function createOrderQueues(state, done)
  {
    state.orderStateQueues = new Map();

    state.plan.orders.forEach(order =>
    {
      if (!state.orderStateQueues.has(order.mrp))
      {
        state.orderStateQueues.set(order.mrp, {
          small: [],
          easy: [],
          hard: []
        });
      }

      state.orderStateQueues.get(order.mrp)[order.kind].push({
        order: order,
        quantityTodo: order.quantityTodo
      });
    });

    for (const orderStateQueues of state.orderStateQueues.values())
    {
      orderStateQueues.small.sort(sortEasyOrders);
      orderStateQueues.easy.sort(sortEasyOrders);
      orderStateQueues.hard.sort(sortHardOrders);
    }

    setImmediate(done);
  }

  function sortEasyOrders(a, b)
  {
    return b.order.manHours - a.order.manHours;
  }

  function sortHardOrders(a, b)
  {
    if (a.order.hardComponents && b.order.hardComponents)
    {
      return b.order.manHours - a.order.manHours;
    }

    if (a.order.hardComponents && !b.order.hardComponents)
    {
      return -1;
    }

    return 1;
  }

  function createLineStates(state, done)
  {
    state.settings.lines.forEach(lineId =>
    {
      const lineSettings = state.settings.line(lineId);
      const lineState = {
        _id: lineId,
        completed: false,
        activeFrom: null, // lineSettings.activeFrom
        activeTo: null, // lineSettings.activeTo
        autoDowntimes: state.autoDowntimes.get(lineId),
        mrpQueue: lineSettings.mrpPriority.map(mrpId =>
        {
          const mrpSettings = state.settings.mrp(mrpId);
          const mrpLineSettings = state.settings.mrpLine(mrpId, lineId);
          const orderStateQueue = state.orderStateQueues.get(mrpId);

          return {
            mrp: mrpSettings,
            line: mrpLineSettings,
            orderPriorityQueue: [].concat(mrpLineSettings.orderPriority),
            orderStateQueue: {
              small: orderStateQueue ? [].concat(orderStateQueue.small) : [],
              easy: orderStateQueue ? [].concat(orderStateQueue.easy) : [],
              hard: orderStateQueue ? [].concat(orderStateQueue.hard) : []
            },
            nextOrderIndex: -1
          };
        })
      };

      state.lineStateQueue.push(lineState);
    });

    setImmediate(done);
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
        console.log('completed');

        lineState.completed = true;

        continue;
      }

      const order = orderState.order;

      console.log(`${order._id} ${order.kind} ${order.quantityTodo}`);
    }

    setImmediate(done);
  }

  function getNextOrderForLine(lineState)
  {
    while (lineState.mrpQueue.length)
    {
      const mrpState = lineState.mrpQueue[0];

      while (mrpState.orderPriorityQueue.length)
      {
        const orderPriority = mrpState.orderPriorityQueue[0];
        const orderStateQueue = mrpState.orderStateQueue[orderPriority];

        while (orderStateQueue.length)
        {
          const orderState = orderStateQueue.shift();

          if (orderState.quantityTodo > 0)
          {
            return orderState;
          }
        }

        mrpState.orderPriorityQueue.shift();
      }

      lineState.mrpQueue.shift();
    }

    return null;
  }
};
