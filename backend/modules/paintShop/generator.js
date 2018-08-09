// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const step = require('h5.step');
const deepEqual = require('deep-equal');
const resolveProductName = require('../util/resolveProductName');

const ORDER_COMPARE_PROPERTIES = [
  'followups',
  'no',
  'date',
  'nc12',
  'name',
  'qty',
  'qtyPaint',
  'mrp',
  'placement',
  'startTime',
  'paint',
  'childOrders'
];

module.exports = function(app, module)
{
  const settingsModule = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const Order = mongoose.model('Order');
  const PaintShopEvent = mongoose.model('PaintShopEvent');
  const PaintShopOrder = mongoose.model('PaintShopOrder');
  const Plan = mongoose.model('Plan');
  const PlanSettings = mongoose.model('PlanSettings');

  app.broker.subscribe('paintShop.generator.requested', handleRequest);

  app.broker.subscribe('planning.changes.created', change =>
  {
    if (change.user !== null || (Object.keys(change.data).length === 1 && change.data.settings))
    {
      return;
    }

    generate(change.plan);
  });

  function handleRequest(message)
  {
    const date = moment.utc(message.date, 'YYYY-MM-DD');

    if (date.isValid())
    {
      generate(date.toDate());
    }
  }

  function generate(date)
  {
    const startedAt = Date.now();
    const key = moment.utc(date).format('YYYY-MM-DD');

    module.debug(`[generator] [${key}] Generating...`);

    step(
      // TODO remove
      function()
      {
        if (key === '2018-08-10')
        {
          return this.skip(new Error('Locked!'));
        }
      },
      function()
      {
        settingsModule.findValues({_id: /^paintShop/}, 'paintShop.', this.parallel());

        PlanSettings
          .findById(date, {requiredStatuses: 1, ignoredStatuses: 1, completedStatuses: 1})
          .lean()
          .exec(this.parallel());

        Plan.aggregate([
          {$match: {_id: date}},
          {$unwind: '$orders'},
          {$match: {'orders.date': key}},
          {$project: {
            _id: '$orders._id',
            name: '$orders.name',
            nc12: '$orders.nc12',
            qtyTodo: '$orders.quantityTodo',
            qtyDone: '$orders.quantityDone',
            mrp: '$orders.mrp',
            statuses: '$orders.statuses'
          }}
        ], this.parallel());

        Plan.aggregate([
          {$match: {_id: date}},
          {$unwind: '$lines'},
          {$unwind: '$lines.orders'},
          {$group: {_id: '$lines.orders.orderNo', startAt: {$min: '$lines.orders.startAt'}}}
        ], this.parallel());
      },
      function(err, settings, planSettings, orders, startTimes)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find plan orders: ${err.message}`));
        }

        this.settings = Object.assign(settings, planSettings);
        this.newOrders = new Map();
        this.deletedOrders = new Set();

        orders.forEach(o =>
        {
          if (isDeletedOrder(o.statuses))
          {
            this.deletedOrders.add(o._id);
          }

          this.newOrders.set(o._id, {
            _id: o._id,
            status: 'new',
            startedAt: null,
            finishedAt: null,
            comment: '',
            order: o._id,
            followups: [],
            no: 0,
            date,
            nc12: o.nc12,
            name: o.name,
            qty: o.qtyTodo,
            qtyDone: 0,
            qtyPaint: 0,
            mrp: o.mrp,
            placement: '',
            startTime: 0,
            paint: null,
            childOrders: []
          });
        });

        startTimes.forEach(o =>
        {
          if (this.newOrders.has(o._id))
          {
            this.newOrders.get(o._id).startTime = o.startAt.getTime();
          }
        });

        setImmediate(this.next());
      },
      function()
      {
        const scheduledStartDate = moment(key, 'YYYY-MM-DD').toDate();
        const workCenters = this.settings.workCenters;
        const leadingOrders = Array.from(this.newOrders.keys());
        const statuses = {
          $in: this.settings.requiredStatuses
        };
        const plannedConditions = {
          scheduledStartDate,
          statuses,
          leadingOrder: {$in: leadingOrders}
        };
        const unplannedConditions = {
          scheduledStartDate,
          statuses,
          leadingOrder: null
        };
        const splitConditions = {
          scheduledStartDate,
          statuses,
          leadingOrder: {$nin: [null].concat(leadingOrders)}
        };

        if (!_.isEmpty(workCenters))
        {
          plannedConditions['operations.workCenter'] = {$in: workCenters};
          unplannedConditions['operations.workCenter'] = {$in: workCenters};
          splitConditions['operations.workCenter'] = {$in: workCenters};
        }

        const fields = {
          leadingOrder: 1,
          name: 1,
          description: 1,
          nc12: 1,
          qty: 1,
          mrp: 1,
          bom: 1,
          statuses: 1
        };

        Order
          .find(plannedConditions, fields)
          .lean()
          .exec(this.parallel());

        Order
          .find(unplannedConditions, fields)
          .lean()
          .exec(this.parallel());

        Order
          .find(splitConditions, fields)
          .lean()
          .exec(this.parallel());
      },
      function(err, childOrders, unplannedOrders, splitChildOrders)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find child orders: ${err.message}`));
        }

        this.childOrderPaintCounts = new Map();
        this.unplannedOrders = new Set();

        unplannedOrders.concat(splitChildOrders).forEach(unplannedOrder =>
        {
          if (isDeletedOrder(unplannedOrder.statuses))
          {
            this.deletedOrders.add(unplannedOrder._id);
          }

          unplannedOrder.leadingOrder = unplannedOrder._id;

          childOrders.push(unplannedOrder);

          this.unplannedOrders.add(unplannedOrder._id);

          if (this.newOrders.has(unplannedOrder._id))
          {
            return;
          }

          this.newOrders.set(unplannedOrder._id, {
            _id: unplannedOrder._id,
            status: 'new',
            startedAt: null,
            finishedAt: null,
            comment: '',
            order: unplannedOrder._id,
            followups: [],
            no: 0,
            date,
            nc12: unplannedOrder.nc12,
            name: unplannedOrder.name,
            qty: unplannedOrder.qty,
            qtyDone: 0,
            qtyPaint: 0,
            mrp: unplannedOrder.mrp,
            placement: '',
            startTime: 0,
            paint: null,
            childOrders: []
          });
        });

        childOrders.forEach(childOrder =>
        {
          if (isDeletedOrder(childOrder.statuses))
          {
            this.deletedOrders.add(childOrder._id);
          }

          const leadingOrder = this.newOrders.get(childOrder.leadingOrder);

          if (!leadingOrder
            || _.isEmpty(childOrder.bom)
            || (!this.unplannedOrders.has(childOrder._id) && childOrder._id === leadingOrder._id))
          {
            return;
          }

          let paint = null;
          let paintCount = 0;

          childOrder.bom.sort((a, b) =>
          {
            if (a.unit === b.unit && (a.unit === 'G' || a.unit === 'KG'))
            {
              return a.name.localeCompare(b.name);
            }

            return 0;
          });

          const components = childOrder.bom.map(component =>
          {
            if (component.unit === 'G' || component.unit === 'KG')
            {
              paintCount += 1;

              if (!paint)
              {
                paint = {
                  nc12: component.nc12,
                  name: component.name
                };
              }
            }

            return {
              nc12: component.nc12,
              name: component.name,
              qty: component.qty,
              unit: component.unit
            };
          });

          if (!paint)
          {
            return;
          }

          this.childOrderPaintCounts.set(childOrder._id, paintCount);

          leadingOrder.childOrders.push({
            order: childOrder._id,
            nc12: childOrder.nc12,
            name: resolveProductName(childOrder),
            qty: childOrder.qty,
            paint,
            components,
            deleted: this.deletedOrders.has(childOrder._id)
          });
        });

        this.newOrders.forEach(newOrder =>
        {
          if (!newOrder.childOrders.length)
          {
            return;
          }

          newOrder.childOrders.sort((a, b) =>
          {
            let cmp = a.paint.nc12.localeCompare(b.paint.nc12);

            if (cmp === 0)
            {
              cmp = a.order.localeCompare(b.order);
            }

            return cmp;
          });

          newOrder.paint = newOrder.childOrders[0].paint;
        });

        setImmediate(this.next());
      },
      function()
      {
        this.multiColorOrders = new Set();

        const newOrders = Array.from(this.newOrders.values());

        this.newOrders.clear();

        newOrders.forEach(newOrder =>
        {
          const originalNewOrder = newOrder;
          const {childOrders} = newOrder;

          if (!childOrders.length)
          {
            return;
          }

          const newOrderIds = [];

          newOrder.childOrders = [];

          childOrders.forEach(childOrder =>
          {
            if (newOrder.paint.nc12 === childOrder.paint.nc12)
            {
              newOrder._id += `-${childOrder.order}`;

              newOrder.childOrders.push(childOrder);

              delete childOrder.paint;
            }
            else
            {
              newOrder._id = createHash('md5').update(newOrder._id).digest('hex').toUpperCase();

              this.newOrders.set(newOrder._id, newOrder);

              newOrderIds.push(newOrder._id);

              newOrder = Object.assign({}, newOrder, {
                _id: `${newOrder.order}-${childOrder.order}`,
                paint: childOrder.paint,
                childOrders: [childOrder]
              });

              delete childOrder.paint;

              this.multiColorOrders.add(newOrder);
            }
          });

          newOrder._id = createHash('md5').update(newOrder._id).digest('hex').toUpperCase();

          this.newOrders.set(newOrder._id, newOrder);

          if (newOrder !== originalNewOrder)
          {
            this.multiColorOrders.add(newOrder);
          }

          newOrderIds.push(newOrder._id);

          if (newOrderIds.length === 1)
          {
            return;
          }

          newOrderIds.forEach(newOrderId =>
          {
            this.newOrders.get(newOrderId).followups = _.without(newOrderIds, newOrderId);
          });
        });
      },
      function()
      {
        PaintShopOrder.find({date}).lean().exec(this.next());
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
        const secondShiftTime = moment.utc(date).hours(14).valueOf();
        const groupedOrders = groupOrdersByPaint(this.newOrders, this.multiColorOrders, secondShiftTime);

        sortGroupedOrders(groupedOrders);

        const newOrders = listNewOrders(groupedOrders, this.newOrders);
        const mergedNewOrders = mergeNewOrders(newOrders, this.newOrders);

        mergedNewOrders.forEach((newOrder, i) =>
        {
          newOrder.no = i + 1;

          newOrder.childOrders.forEach(childOrder =>
          {
            newOrder.qtyPaint += childOrder.qty * this.childOrderPaintCounts.get(childOrder.order);
          });
        });

        setImmediate(this.next());
      },
      function()
      {
        this.changeLog = {
          added: [],
          changed: [],
          removed: []
        };
        this.changes = {
          added: [],
          changed: [],
          removed: []
        };
        this.events = [];

        this.oldOrders.forEach(oldOrder =>
        {
          const newOrder = this.newOrders.get(oldOrder._id);

          this.newOrders.delete(oldOrder._id);

          if (!newOrder || newOrder.childOrders.length === 0)
          {
            logChange(this.changeLog.removed, oldOrder);

            if (oldOrder.status === 'new')
            {
              this.changes.removed.push(oldOrder._id);
            }
            else if (oldOrder.status === 'partial')
            {
              this.changes.changed.push({
                _id: oldOrder._id,
                status: 'cancelled',
                comment: recordEvent(this.events, 'cancelled', oldOrder)
              });
            }
            else if (oldOrder.status !== 'cancelled')
            {
              this.changes.changed.push({
                _id: oldOrder._id,
                comment: recordEvent(this.events, 'comment', oldOrder)
              });
            }

            return;
          }

          const changed = compareOrders(oldOrder, newOrder, this.events, this.deletedOrders.has(oldOrder.order));

          if (changed)
          {
            logChange(this.changeLog.changed, newOrder);

            this.changes.changed.push(changed);
          }
        });

        this.newOrders.forEach(newOrder =>
        {
          if (!newOrder.childOrders.length)
          {
            return;
          }

          if (this.deletedOrders.has(newOrder.order))
          {
            newOrder.status = 'cancelled';
            newOrder.comment = recordEvent(this.events, 'cancelled', newOrder);
          }

          logChange(this.changeLog.added, newOrder);

          this.changes.added.push(newOrder);
        });

        setImmediate(this.next());
      },
      function()
      {
        const {added, changed, removed} = this.changes;

        this.notAdded = new Map();

        if (added.length)
        {
          const next = this.group();

          PaintShopOrder.collection.insertMany(
            added,
            {ordered: false},
            (err, res) =>
            {
              if (err && err.result)
              {
                res = err.result;
              }

              if (res && res.hasWriteErrors && res.hasWriteErrors())
              {
                res.getWriteErrors().forEach(writeError =>
                {
                  const duplicateOrder = writeError.getOperation();

                  this.notAdded.set(duplicateOrder._id, duplicateOrder);
                });

                this.changes.added = added.filter(o => !this.notAdded.has(o._id));
              }

              next(err && err.code === 11000 ? null : err);
            }
          );
        }

        if (this.events.length)
        {
          const next = this.group();

          PaintShopEvent.collection.insertMany(this.events, {ordered: false}, err =>
          {
            if (err)
            {
              module.error(`[generator] [${key}] Failed to save events: ${err.message}`);
            }

            next();
          });
        }

        if (removed.length)
        {
          PaintShopOrder.collection.deleteMany({_id: {$in: removed}}, this.group());
        }

        changed.forEach(change =>
        {
          PaintShopOrder.collection.updateOne({_id: change._id}, {$set: change}, this.group());
        });
      },
      function(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.notAdded.forEach(duplicateOrder =>
        {
          const next = this.group();
          const filter = {_id: duplicateOrder._id};
          const update = {$set: _.pick(duplicateOrder, ORDER_COMPARE_PROPERTIES)};
          const options = {returnOriginal: false};

          PaintShopOrder.collection.findOneAndUpdate(filter, update, options, (err, res) =>
          {
            if (err)
            {
              module.error(
                `[generator] [${key}] Failed to update duplicate order [${duplicateOrder._id}]: ${err.message}`
              );
            }
            else if (res.ok)
            {
              this.changes.added.push(res.value);
            }

            next();
          });
        });
      },
      function(err)
      {
        if (err)
        {
          return module.error(`[generator] [${key}] Failed to generate: ${err.message}`);
        }

        const added = this.changes.added.length;
        const changed = this.changes.changed.length;
        const removed = this.changes.removed.length;
        const duration = (Date.now() - startedAt) / 1000;

        module.debug(
          `[generator] [${key}] ${added} added, ${changed} changed, ${removed} removed in ${duration}s`
        );

        if (added || changed || removed)
        {
          app.broker.publish(`paintShop.orders.changed.${key}`, {
            date: date,
            changes: this.changes
          });

          saveChangeLog(key, this.changeLog);
        }
      }
    );
  }

  function recordEvent(events, type, order)
  {
    const comment = 'Zlecenie usunięte z planu.';

    if (order.comment !== comment)
    {
      events.push({
        order: order._id,
        type: type,
        time: new Date(),
        user: {
          id: null,
          ip: '127.0.0.1',
          label: 'System'
        },
        data: {comment}
      });
    }

    return comment;
  }

  function isDeletedOrder(statuses)
  {
    return statuses.includes('TECO') || statuses.includes('DLFL') || statuses.includes('DLT');
  }

  function logChange(changeLog, psOrder)
  {
    if (module.config.generatorLogPath)
    {
      changeLog.push([psOrder._id, psOrder.order].concat(psOrder.childOrders.map(o => o.order)));
    }
  }

  function saveChangeLog(key, changeLog)
  {
    if (!module.config.generatorLogPath)
    {
      return;
    }

    const logFilePath = path.join(module.config.generatorLogPath, `${key}.${Date.now()}.json`);

    fs.writeFile(logFilePath, JSON.stringify(changeLog, null, 2), err =>
    {
      if (err)
      {
        module.error(`Failed to save log data: ${err.message}`);
      }
    });
  }

  function groupOrdersByPaint(newOrders, multiColorOrders, secondShiftTime)
  {
    const paintToOrders = {};

    newOrders.forEach(newOrder =>
    {
      if (multiColorOrders.has(newOrder))
      {
        return;
      }

      const paint = newOrder.paint.nc12;

      if (!paintToOrders[paint])
      {
        paintToOrders[paint] = {
          firstShiftOrderCount: 0,
          firstShiftQuantity: 0,
          orders: []
        };
      }

      if (!multiColorOrders.has(newOrder))
      {
        paintToOrders[paint].orders.push(newOrder);
      }

      if (newOrder.startTime < secondShiftTime)
      {
        paintToOrders[paint].firstShiftOrderCount += 1;

        newOrder.childOrders.forEach(childOrder =>
        {
          paintToOrders[paint].firstShiftQuantity += childOrder.qty;
        });
      }
    });

    return _.values(paintToOrders);
  }

  function sortGroupedOrders(groupedOrders)
  {
    groupedOrders.forEach(group => group.orders.sort(sortByStartTime));

    groupedOrders.sort((groupA, groupB) =>
    {
      if (groupA.firstShiftOrderCount !== groupB.firstShiftOrderCount)
      {
        return groupB.firstShiftOrderCount - groupA.firstShiftOrderCount;
      }

      if (groupA.firstShiftQuantity !== groupB.firstShiftQuantity)
      {
        return groupB.firstShiftQuantity - groupA.firstShiftQuantity;
      }

      return sortByStartTime(groupA.orders[0], groupB.orders[0]);
    });
  }

  function listNewOrders(groupedOrders, allOrders)
  {
    const newOrders = [];
    const followups = new Set();
    let lastPaint = null;

    groupedOrders.forEach(group =>
    {
      group.orders.forEach(order =>
      {
        if (lastPaint !== null && lastPaint.nc12 !== order.paint.nc12)
        {
          Array.from(followups).sort(sortByStartTime).forEach(splitOrder => newOrders.push(splitOrder));

          followups.clear();
        }

        newOrders.push(order);

        order.followups.forEach(followupId =>
        {
          followups.add(allOrders.get(followupId));
        });

        lastPaint = order.paint;
      });
    });

    Array.from(followups).sort(sortByStartTime).forEach(splitOrder => newOrders.push(splitOrder));

    return newOrders;
  }

  function mergeNewOrders(newOrders, allOrders)
  {
    if (!newOrders.length)
    {
      return [];
    }

    const mergedOrders = [newOrders[0]];

    for (let i = newOrders.length - 1; i >= 1; --i)
    {
      const nextOrder = newOrders[i];
      const prevOrder = newOrders[i - 1];

      if (nextOrder.order !== prevOrder.order)
      {
        mergedOrders.unshift(nextOrder);

        continue;
      }

      allOrders.delete(nextOrder._id);

      prevOrder.childOrders.push.apply(prevOrder.childOrders, nextOrder.childOrders);

      prevOrder.followups.forEach(followupId =>
      {
        const followup = allOrders.get(followupId);

        if (followup)
        {
          followup.followups = _.without(followup.followups, prevOrder._id);
        }
      });
    }

    return mergedOrders;
  }

  function sortByStartTime(a, b)
  {
    if (a.startTime === b.startTime)
    {
      return 0;
    }

    if (a.startTime === 0 && b.startTime !== 0)
    {
      return 1;
    }

    if (a.startTime !== 0 && b.startTime === 0)
    {
      return -1;
    }

    return a.startTime - b.startTime;
  }

  function compareOrders(oldOrder, newOrder, events, deleted)
  {
    const changes = {
      _id: oldOrder._id
    };

    if (deleted)
    {
      if (oldOrder.status === 'new' || oldOrder.status === 'partial')
      {
        changes.status = 'cancelled';
        changes.comment = recordEvent(events, 'cancelled', oldOrder);
      }
      else if (oldOrder.status !== 'cancelled')
      {
        changes.comment = recordEvent(events, 'comment', oldOrder);
      }
    }

    ORDER_COMPARE_PROPERTIES.forEach(p =>
    {
      const oldValue = oldOrder[p];
      const newValue = newOrder[p];

      if (p === 'childOrders')
      {
        if (!compareChildOrders(oldValue, newValue))
        {
          changes[p] = newValue;
        }

        return;
      }

      if (!deepEqual(oldValue, newValue))
      {
        changes[p] = newValue;
      }
    });

    return Object.keys(changes).length > 1 ? changes : null;
  }

  function compareChildOrders(oldChildOrders, newChildOrders)
  {
    if (oldChildOrders.length !== newChildOrders.length)
    {
      return false;
    }

    for (let i = 0; i < oldChildOrders.length; ++i)
    {
      const oldChildOrder = oldChildOrders[i];
      const newChildOrder = newChildOrders.find(o => o.order === oldChildOrder.order);

      if (!newChildOrder)
      {
        return false;
      }

      if (!deepEqual(oldChildOrders, newChildOrder))
      {
        return false;
      }
    }

    return true;
  }
};
