// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const moment = require('moment');
const util = require('./util');
const resolveProductName = require('../util/resolveProductName');

module.exports = function(mongoose, options, done)
{
  const DailyMrpCount = mongoose.model('DailyMrpCount');
  const ClipOrderCache = mongoose.model('ClipOrderCache');
  const Order = mongoose.model('Order');
  const Setting = mongoose.model('Setting');

  Object.assign(options, {
    dateProperty: 'finishDate',
    findDateProperty: 'scheduledStartDate',
    dataDateProperty: 'scheduledFinishDate',
    dataHoursOffset: '30: *',
    ignoreDone: true,
    ignoredMrps: 'KS1,KS2,KS3,KS4,KS5,KS6,KS7,KS9,KSA,KSB,KSC,KSD,KSE,KSH'.split(','),
    ignoredStatuses: 'TECO,DEL,DLT,DLFL'.split(','),
    requiredStatuses: 'REL'.split(','),
    productionStatuses: 'CNF'.split(','),
    endToEndStatuses: 'DLV'.split(','),
    orderFilterMode: 'red',
    orderFilterStatuses: []
  });

  const dataHoursOffset = {
    '*': 30
  };

  const results = {
    options,
    orderCount: 0,
    orderHash: null,
    parent: [],
    children: {},
    mrps: {},
    groups: {},
    delayReasons: {},
    orders: []
  };
  const fromLocal = moment(options.fromTime);
  const toLocal = moment(options.toTime);
  const fromUtc = moment.utc(fromLocal.format('YYYY-MM-DD'), 'YYYY-MM-DD');
  const toUtc = moment.utc(toLocal.format('YYYY-MM-DD'), 'YYYY-MM-DD');
  const expireAt = moment().add(1, 'hours').toDate();
  const orderFilters = {};

  step(
    function()
    {
      const countProperty = options.orgUnitType
        ? `count.${options.orgUnitType}.${options.orgUnitId}`
        : 'count.all';
      const conditions = {
        _id: {
          $gte: fromUtc.toDate(),
          $lt: toUtc.toDate()
        }
      };

      DailyMrpCount.find(conditions, {[countProperty]: 1}).lean().exec(this.parallel());

      Setting.find({_id: /^reports\.clip\./}, {value: 1}).lean().exec(this.parallel());
    },
    function(err, dailyMrpCounts, settings)
    {
      if (err)
      {
        return this.skip(err);
      }

      settings.forEach(setting => options[setting._id.replace('reports.clip.', '')] = setting.value);

      options.dataHoursOffset.split('\n').forEach(line =>
      {
        const parts = line.split(':');
        const hours = parseInt(parts[0], 10);
        const mrps = parts[1].trim().split(', ');

        mrps.forEach(mrp => dataHoursOffset[mrp] = hours);
      });

      this.keyToMrps = {};
      this.dayToMrps = {};

      dailyMrpCounts.forEach(dailyMrpCount =>
      {
        let mrps = dailyMrpCount.count;

        if (!options.orgUnitType)
        {
          mrps = mrps.all;
        }
        else if (mrps[options.orgUnitType] && mrps[options.orgUnitType][options.orgUnitId])
        {
          mrps = mrps[options.orgUnitType][options.orgUnitId];
        }
        else
        {
          mrps = [];
        }

        const day = moment(moment.utc(dailyMrpCount._id).format('YYYY-MM-DD'), 'YYYY-MM-DD').valueOf();
        const key = util.createGroupKey(options.interval, day, false);

        if (!this.keyToMrps[key])
        {
          this.keyToMrps[key] = {};
        }

        this.dayToMrps[day] = {};

        if (options.orgUnitType === 'mrpController')
        {
          if (!_.isEmpty(mrps) && !options.ignoredMrps.includes(options.orgUnitId))
          {
            mrps.prodFlow.forEach(prodFlow => results.children[prodFlow] = true);
            results.parent = mrps.subdivision;
            results.mrps[options.orgUnitId] = true;
            this.keyToMrps[key][options.orgUnitId] = true;
            this.dayToMrps[day][options.orgUnitId] = true;
          }

          return;
        }

        mrps.forEach(mrp =>
        {
          if (options.ignoredMrps.includes(mrp))
          {
            return;
          }

          results.mrps[mrp] = true;
          this.keyToMrps[key][mrp] = true;
          this.dayToMrps[day][mrp] = true;
        });
      });

      results.mrps = Object.keys(results.mrps);

      setImmediate(this.next());
    },
    function()
    {
      const conditions = {
        [options.findDateProperty]: {
          $gte: fromLocal.toDate(),
          $lt: toLocal.toDate()
        },
        mrp: {$in: results.mrps}
      };

      if (options.requiredStatuses)
      {
        conditions.statuses = {$in: options.requiredStatuses};
      }

      if (options.ignoredStatuses)
      {
        if (!conditions.statuses)
        {
          conditions.statuses = {};
        }

        conditions.statuses.$nin = options.ignoredStatuses;
      }

      const fields = {
        nc12: 1,
        name: 1,
        description: 1,
        qty: 1,
        'qtyDone.total': 1,
        mrp: 1,
        scheduledStartDate: 1,
        scheduledFinishDate: 1,
        startDate: 1,
        finishDate: 1,
        delayReason: 1,
        statuses: 1,
        'changes.time': 1,
        'changes.oldValues.statuses': 1,
        'changes.newValues.statuses': 1,
        'changes.comment': 1
      };
      const hint = {
        [options.findDateProperty]: -1
      };
      const cursor = Order.find(conditions, fields).lean().hint(hint).cursor({batchSize: 20});
      const next = _.once(this.next());

      cursor.on('error', next);
      cursor.on('end', next);
      cursor.on('data', order =>
      {
        const dataTime = moment(order[options.dataDateProperty])
          .add(dataHoursOffset[order.mrp] || dataHoursOffset['*'], 'hours')
          .valueOf();

        order.productionStatus = null;
        order.endToEndStatus = null;

        order.statuses.forEach(status =>
        {
          if (options.productionStatuses.includes(status))
          {
            order.productionStatus = status;
          }

          if (options.endToEndStatuses.includes(status))
          {
            order.endToEndStatus = status;
          }
        });

        order.confirmed = !!orderFilters[options.orderFilterMode] && !orderFilters[options.orderFilterMode](order);
        order.comment = null;
        order.productionTime = null;
        order.productionStatus = null;
        order.endToEndTime = null;
        order.endToEndStatus = null;

        for (let i = 0; i < order.changes.length; ++i)
        {
          if (order.changes[i].oldValues.statuses)
          {
            order.statuses = order.changes[i].oldValues.statuses;

            break;
          }
        }

        order.changes.forEach(change =>
        {
          if (!_.isEmpty(change.comment))
          {
            order.comment = change.comment;
          }

          if (!change.newValues.statuses || change.time > dataTime)
          {
            return;
          }

          order.statuses = change.newValues.statuses;

          order.statuses.forEach(status =>
          {
            if (options.productionStatuses.includes(status)
              && (!order.productionTime || status !== order.productionStatus))
            {
              order.productionTime = change.time.getTime();
              order.productionStatus = status;
            }

            if (options.endToEndStatuses.includes(status)
              && (!order.endToEndTime || status !== order.endToEndStatus))
            {
              order.endToEndTime = change.time.getTime();
              order.endToEndStatus = status;
            }
          });
        });

        order._id = {
          hash: options.hash,
          no: order._id
        };
        order.expireAt = expireAt;
        order.name = resolveProductName(order);
        order.startDate = Date.parse(order.startDate);
        order.finishDate = Date.parse(order.finishDate);
        order.scheduledStartDate = Date.parse(order.scheduledStartDate);
        order.scheduledFinishDate = Date.parse(order.scheduledFinishDate);
        order.qtyDone = order.qtyDone ? order.qtyDone.total : 0;
        order.description = undefined;
        order.changes = undefined;

        if (order.delayReason)
        {
          if (!results.delayReasons[order.delayReason])
          {
            results.delayReasons[order.delayReason] = 0;
          }

          results.delayReasons[order.delayReason] += 1;
        }

        const group = getGroup(order[options.findDateProperty]);

        group.orderCount += 1;

        order.statuses.forEach(status =>
        {
          if (options.productionStatuses.includes(status))
          {
            group.productionCount += 1;
          }

          if (options.endToEndStatuses.includes(status))
          {
            group.endToEndCount += 1;
          }
        });

        if (options.ignoreDone && order.qtyDone >= order.qty)
        {
          return;
        }

        if (orderFilters[options.orderFilterMode] && orderFilters[options.orderFilterMode](order))
        {
          results.orders.push(order);
        }
      });
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      ClipOrderCache.collection.remove({'_id.hash': options.hash}, this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (results.orders.length)
      {
        ClipOrderCache.collection.insertMany(results.orders, {ordered: false}, this.next());
      }
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const createNextGroupKey = util.createCreateNextGroupKey(options.interval);
      const groupKeys = Object.keys(results.groups).map(k => +k).sort();
      const groups = [];
      const toGroupKey = _.last(groupKeys);
      let groupKey = groupKeys[0];

      while (groupKey <= toGroupKey)
      {
        groups.push(getGroup(groupKey));

        groupKey = createNextGroupKey(groupKey);
      }

      results.groups = groups;
      results.parent = results.parent[0] || null;
      results.children = Object.keys(results.children);

      if (!results.children.length && results.mrps.length)
      {
        results.children = results.mrps;
      }

      results.delayReasons = Object
        .keys(results.delayReasons)
        .sort((a, b) => results.delayReasons[b] - results.delayReasons[a])
        .map(k => ({_id: k, count: results.delayReasons[k]}));

      results.orderHash = options.hash;
      results.orderCount = results.orders.length;
      results.orders = undefined;
      options.hash = undefined;

      setImmediate(this.next());
    },
    function(err)
    {
      if (err)
      {
        done(err, null);
      }
      else
      {
        done(null, results);
      }
    }
  );

  function getGroup(date)
  {
    const key = util.createGroupKey(options.interval, date, false);

    if (!results.groups[key])
    {
      results.groups[key] = {
        key: key,
        orderCount: 0,
        productionCount: 0,
        endToEndCount: 0
      };
    }

    return results.groups[key];
  }

  // Not confirmed by the production or not confirmed by the warehouse
  orderFilters.red = function(order)
  {
    return !order.productionStatus || !order.endToEndStatus;
  };

  // Has all of the specified statuses
  orderFilters.all = function(order)
  {
    const requiredStatuses = options.orderFilterStatuses;
    const actualStatuses = order.statuses;

    for (let i = 0; i < requiredStatuses.length; ++i)
    {
      if (!actualStatuses.includes(requiredStatuses[i]))
      {
        return false;
      }
    }

    return true;
  };

  // Does not have all of the specified statuses
  orderFilters.none = function(order)
  {
    const requiredStatuses = options.orderFilterStatuses;
    const actualStatuses = order.statuses;

    for (let i = 0; i < requiredStatuses.length; ++i)
    {
      if (actualStatuses.includes(requiredStatuses[i]))
      {
        return false;
      }
    }

    return true;
  };

  // Does not have one of the specified statuses
  orderFilters.without = function(order)
  {
    const requiredStatuses = options.orderFilterStatuses;
    const actualStatuses = order.statuses;

    for (let i = 0; i < requiredStatuses.length; ++i)
    {
      if (!actualStatuses.includes(requiredStatuses[i]))
      {
        return true;
      }
    }

    return false;
  };

  // Has any specified status
  orderFilters.any = function(order)
  {
    const requiredStatuses = options.orderFilterStatuses;
    const actualStatuses = order.statuses;

    for (let i = 0; i < requiredStatuses.length; ++i)
    {
      if (actualStatuses.includes(requiredStatuses[i]))
      {
        return true;
      }
    }

    return false;
  };
};
