// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const deepEqual = require('deep-equal');

const DEFAULT_SETTINGS = {
  ignoredMrps: [],
  groupDuration: 2,
  groupExtraItems: 5
};
const ORDER_COMPARE_PROPERTIES = [
  'date',
  'qty',
  'startTime',
  'finishTime'
];

module.exports = function(app, module)
{
  const settingsModule = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const WhOrder = mongoose.model('WhOrder');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');

  const generatorQueue = [];
  let generatorState = null;
  let generatorTimer = null;

  app.broker.subscribe('wh.generator.requested', handleRequest);

  app.broker.subscribe('settings.updated.wh.planning.**', generateActivePlans);

  app.broker.subscribe('planning.changes.created', change =>
  {
    if (change.user !== null || (Object.keys(change.data).length === 1 && change.data.settings))
    {
      return;
    }

    generatePlan(change.plan);
  });

  function handleRequest(message)
  {
    const date = moment.utc(message.date, 'YYYY-MM-DD');

    if (date.isValid())
    {
      generatePlan(date.toDate());
    }
  }

  function createPlanGeneratorState(key)
  {
    return {
      key,
      date: moment.utc(key, 'YYYY-MM-DD').toDate(),
      cancelled: false,
      log: message => module.debug(`[generator] [${key}] ${message}`)
    };
  }

  function generateActivePlans()
  {
    const now = moment();
    const from = moment.utc(now.format('YYYY-MM-DD'), 'YYYY-MM-DD');

    if (now.hours() < 6)
    {
      from.subtract(1, 'days');
    }

    Plan.find({_id: {$gt: from}}, {_id: 1}).lean().exec((err, plans) =>
    {
      if (err)
      {
        module.error(`[generator] Failed to find active plans: ${err.message}`);
      }

      plans.forEach(plan => generatePlan(moment.utc(plan._id).format('YYYY-MM-DD')));
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

      app.broker.publish('wh.generator.started', {
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
    if (generatorState)
    {
      return;
    }

    const planKey = generatorQueue.sort((a, b) => a.localeCompare(b)).shift();

    if (!planKey)
    {
      return;
    }

    generatorTimer = null;
    generatorState = createPlanGeneratorState(planKey);

    tryGeneratePlan(generatorState, () =>
    {
      if (generatorState.cancelled && !generatorQueue.includes(planKey))
      {
        generatorQueue.push(planKey);
      }

      generatorState = null;

      if (generatorTimer !== null)
      {
        clearTimeout(generatorTimer);
      }

      generatorTimer = setTimeout(generateNextPlan, 1);
    });
  }

  function tryGeneratePlan(state, done)
  {
    const startedAt = Date.now();

    state.log(`Generating...`);

    step(
      function()
      {
        settingsModule.findValues({_id: /^wh\.planning/}, 'wh.planning.', this.parallel());

        PlanSettings
          .findById(state.date, {requiredStatuses: 1, ignoredStatuses: 1})
          .lean()
          .exec(this.parallel());

        Plan.aggregate([
          {$match: {_id: state.date}},
          {$unwind: '$lines'},
          {$unwind: '$lines.orders'},
          {$project: {
            line: '$lines._id',
            order: '$lines.orders.orderNo',
            quantity: '$lines.orders.quantity',
            startAt: '$lines.orders.startAt',
            finishAt: '$lines.orders.finishAt'
          }}
        ], this.parallel());
      },
      function(err, whSettings, planSettings, lineOrders)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to fetch data: ${err.message}`, err.code, 500));
        }

        this.settings = Object.assign(DEFAULT_SETTINGS, whSettings, planSettings);
        this.noToOrders = new Map();
        this.lineToOrders = new Map();

        lineOrders.forEach(lineOrder =>
        {
          const {order} = lineOrder;

          if (!this.noToOrders.has(order))
          {
            this.noToOrders.set(order, []);
          }

          this.noToOrders.get(order).push(lineOrder);
        });

        setImmediate(this.next());
      },
      function()
      {
        const conditions = {
          _id: {
            $in: Array.from(this.noToOrders.keys())
          },
          statuses: {
            $in: this.settings.requiredStatuses,
            $nin: this.settings.ignoredStatuses
          }
        };

        if (!_.isEmpty(this.settings.ignoredMrps))
        {
          conditions.mrp = {
            $nin: this.settings.ignoredMrps
          };
        }

        const fields = {
          _id: 1
        };

        Order
          .find(conditions, fields)
          .lean()
          .exec(this.parallel());
      },
      function(err, orderList)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to find SAP orders: ${err.message}`, err.code, 500));
        }

        const orderSet = new Set(orderList.map(o => o._id));

        this.lineToOrders = new Map();

        this.noToOrders.forEach((lineOrders, orderNo) =>
        {
          if (!orderSet.has(orderNo))
          {
            return;
          }

          lineOrders.forEach(lineOrder =>
          {
            if (!this.lineToOrders.has(lineOrder.line))
            {
              this.lineToOrders.set(lineOrder.line, []);
            }

            this.lineToOrders.get(lineOrder.line).push(lineOrder);
          });
        });

        this.noToOrders = null;

        setImmediate(this.next());
      },
      function()
      {
        const whOrders = [];
        const groupExtraItems = this.settings.groupExtraItems;
        const groupDuration = this.settings.groupDuration;
        const groupTimeWindow = groupDuration * 3600 * 1000;

        this.lineToOrders.forEach(lineOrders =>
        {
          lineOrders.forEach(lineOrder =>
          {
            const duration = lineOrder.finishAt - lineOrder.startAt;
            const whOrder = createOrder(lineOrder, state.date, groupDuration);

            if (duration > groupTimeWindow)
            {
              const pceTime = Math.ceil(duration / lineOrder.quantity);

              splitOrder(whOrders, whOrder, groupDuration, groupTimeWindow, duration, pceTime);
            }
            else
            {
              whOrders.push(whOrder);
            }

            combineOrder(whOrders, groupExtraItems);
          });
        });

        this.newOrders = new Map();

        whOrders.forEach(whOrder =>
        {
          whOrder._id = createHash('md5')
            .update(`${state.key}:${whOrder.order}:${whOrder.line}:${whOrder.group}`)
            .digest('hex');

          this.newOrders.set(whOrder._id, whOrder);
        });

        this.lineToOrders = null;

        setImmediate(this.next());
      },
      function()
      {
        WhOrder.find({date: state.date}).lean().exec(this.next());
      },
      function(err, oldOrders)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find paint-shop orders: ${err.message}`));
        }

        this.oldOrders = new Map();

        oldOrders.forEach(o => this.oldOrders.set(o._id, o));

        setImmediate(this.next());
      },
      function()
      {
        this.changes = {
          added: [],
          changed: [],
          removed: []
        };

        state.log(`Comparing ${this.newOrders.size} old with ${this.oldOrders.size} new...`);

        this.oldOrders.forEach(oldOrder =>
        {
          const newOrder = this.newOrders.get(oldOrder._id);

          this.newOrders.delete(oldOrder._id);

          if (!newOrder)
          {
            if (oldOrder.status === 'pending')
            {
              this.changes.removed.push(oldOrder._id);
            }
            else
            {
              this.changes.changed.push({
                _id: oldOrder._id,
                status: 'cancelled',
                problem: 'PLAN'
              });
            }

            return;
          }

          const changed = compareOrders(oldOrder, newOrder);

          if (changed)
          {
            this.changes.changed.push(changed);
          }
        });

        this.newOrders.forEach(newOrder =>
        {
          this.changes.added.push(newOrder);
        });

        setImmediate(this.next());
      },
      function()
      {
        if (state.cancelled)
        {
          this.changes = null;

          return this.skip();
        }

        const {added, changed, removed} = this.changes;

        if (added.length)
        {
          const next = this.group();

          WhOrder.collection.insertMany(added, {ordered: false}, (err, res) =>
          {
            if (res && res.hasWriteErrors && res.hasWriteErrors())
            {
              const notAdded = new Set();

              res.getWriteErrors().forEach(writeError => notAdded.add(writeError.getOperation()._id));

              this.changes.added = added.filter(o => !notAdded.has(o._id));
            }

            next(err && err.code === 11000 ? null : err);
          });
        }

        if (removed.length)
        {
          WhOrder.collection.deleteMany({_id: {$in: removed}}, this.group());
        }

        changed.forEach(change =>
        {
          WhOrder.collection.updateOne({_id: change._id}, {$set: change}, this.group());
        });
      },
      function(err)
      {
        if (err)
        {
          module.error(`[generator] [${state.key}] ${err.message}`);
        }
        else if (this.changes)
        {
          const added = this.changes.added.length;
          const changed = this.changes.changed.length;
          const removed = this.changes.removed.length;
          const duration = (Date.now() - startedAt) / 1000;

          state.log(`${added} added, ${changed} changed, ${removed} removed in ${duration}s`);

          if (added || changed || removed)
          {
            app.broker.publish(`wh.orders.changed.${state.key}`, {
              date: state.date,
              changes: this.changes
            });
          }
        }

        if (state.cancelled)
        {
          state.log(`[generator] [${state.key}] Cancelled!`);
        }
        else
        {
          app.broker.publish('wh.generator.finished', {
            date: state.key
          });
        }

        done();
      }
    );
  }

  function compareOrders(oldOrder, newOrder)
  {
    const changes = {
      _id: oldOrder._id
    };
    let anyChanges = false;

    ORDER_COMPARE_PROPERTIES.forEach(p =>
    {
      const oldValue = oldOrder[p];
      const newValue = newOrder[p];

      if (!deepEqual(oldValue, newValue))
      {
        changes[p] = newValue;
        anyChanges = true;
      }
    });

    return anyChanges ? changes : null;
  }

  function createOrder(lineOrder, date, groupDuration)
  {
    return {
      _id: '',
      status: 'pending',
      problem: '',
      order: lineOrder.order,
      group: getOrderGroup(lineOrder.startAt, groupDuration),
      line: lineOrder.line,
      set: null,
      startedAt: null,
      finishedAt: null,
      date,
      qty: lineOrder.quantity,
      startTime: lineOrder.startAt,
      finishTime: lineOrder.finishAt,
      picklistFunc: null,
      picklistDone: false,
      funcs: ['fmx', 'kitter', 'packer'].map(createFunc),
      users: []
    };
  }

  function createFunc(id)
  {
    return {
      _id: id,
      user: null,
      startedAt: null,
      finishedAt: null,
      status: 'pending',
      picklist: 'pending',
      pickup: 'pending',
      carts: [],
      problemArea: '',
      comment: ''
    };
  }

  function getOrderGroup(startTime, groupDuration)
  {
    let startHour = startTime.getUTCHours();

    if (startHour < 6)
    {
      startHour = 18 + startHour;
    }
    else
    {
      startHour -= 6;
    }

    return Math.floor(startHour / groupDuration) + 1;
  }

  function splitOrder(whOrders, bigWhOrder, groupDuration, groupTimeWindow, duration, pceTime)
  {
    const partCount = Math.ceil(duration / groupTimeWindow);
    let qty = bigWhOrder.qty;
    let startTime = bigWhOrder.startTime;
    let group = bigWhOrder.group;
    const groupStartTime = moment.utc(startTime)
      .startOf('day')
      .add(6 + (group - 1) * groupDuration, 'hours')
      .valueOf();
    let groupFinishTime = groupStartTime + groupTimeWindow;

    for (let i = 0; i < partCount; ++i)
    {
      const availableTime = groupFinishTime - startTime;
      const maxQty = Math.floor(availableTime / pceTime);
      const smallWhOrder = _.assign(_.cloneDeep(bigWhOrder), {
        startTime: startTime,
        finishTime: 0,
        group: group++,
        qty: Math.min(qty, maxQty)
      });

      whOrders.push(smallWhOrder);

      qty -= smallWhOrder.qty;
      startTime = smallWhOrder.finishTime = new Date(startTime.getTime() + pceTime * smallWhOrder.qty);
      groupFinishTime += groupTimeWindow;
    }
  }

  function combineOrder(whOrders, groupExtraItems)
  {
    const prevPart = whOrders[whOrders.length - 2];

    if (!prevPart)
    {
      return;
    }

    const lastPart = whOrders[whOrders.length - 1];

    if (lastPart.order !== prevPart.order)
    {
      return;
    }

    if (lastPart.qty <= groupExtraItems)
    {
      prevPart.finishTime = lastPart.finishTime;
      prevPart.qty += lastPart.qty;

      whOrders.pop();
    }

    let firstPartI = -1;

    for (let i = whOrders.length - 1; i >= 0; --i)
    {
      if (whOrders[i].order !== lastPart.order)
      {
        break;
      }

      firstPartI = i;
    }

    const firstPart = whOrders[firstPartI];

    if (firstPart.qty <= groupExtraItems)
    {
      const nextPart = whOrders[firstPartI + 1];

      if (nextPart)
      {
        nextPart.startTime = firstPart.startTime;
        nextPart.qty += firstPart.qty;

        whOrders.splice(firstPartI, 1);
      }
    }
  }
};
