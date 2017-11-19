// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
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
  const PaintShopOrder = mongoose.model('PaintShopOrder');
  const Plan = mongoose.model('Plan');

  app.broker.subscribe('paintShop.generator.requested', handleRequest);

  app.broker.subscribe('planning.changes.created', change => generate(change.plan));

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
      function()
      {
        settingsModule.findValues({_id: /^paintShop/}, 'paintShop.', this.parallel());

        Plan.aggregate([
          {$match: {_id: date}},
          {$unwind: '$orders'},
          {$match: {'orders.date': key}},
          {$project: {
            _id: '$orders._id',
            name: '$orders.name',
            nc12: '$orders.nc12',
            qty: '$orders.quantityTodo',
            mrp: '$orders.mrp'
          }}
        ], this.parallel());

        Plan.aggregate([
          {$match: {_id: date}},
          {$unwind: '$lines'},
          {$unwind: '$lines.orders'},
          {$group: {_id: '$lines.orders.orderNo', startAt: {$min: '$lines.orders.startAt'}}}
        ], this.parallel());
      },
      function(err, settings, orders, startTimes)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find plan orders: ${err.message}`));
        }

        this.settings = settings;
        this.newOrders = new Map();

        orders.forEach(o =>
        {
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
            qty: o.qty,
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
        const conditions = {
          leadingOrder: {$in: Array.from(this.newOrders.keys())}
        };

        if (!_.isEmpty(this.settings.workCenters))
        {
          conditions['operations.workCenter'] = {$in: this.settings.workCenters};
        }

        const fields = {
          leadingOrder: 1,
          name: 1,
          description: 1,
          nc12: 1,
          qty: 1,
          mrp: 1,
          bom: 1
        };

        Order.find(conditions, fields).sort({_id: 1}).lean().exec(this.parallel());
      },
      function(err, childOrders)
      {
        if (err)
        {
          return this.skip(new Error(`Failed to find child orders: ${err.message}`));
        }

        childOrders.forEach(childOrder =>
        {
          const leadingOrder = this.newOrders.get(childOrder.leadingOrder);

          if (!leadingOrder || _.isEmpty(childOrder.bom))
          {
            return;
          }

          let paint = null;

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
            if (!paint && (component.unit === 'G' || component.unit === 'KG'))
            {
              paint = {
                nc12: component.nc12,
                name: component.name
              };
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

          leadingOrder.childOrders.push({
            order: childOrder._id,
            nc12: childOrder.nc12,
            name: resolveProductName(childOrder),
            qty: childOrder.qty,
            paint,
            components
          });
        });

        this.newOrders.forEach(newOrder =>
        {
          if (!newOrder.childOrders.length)
          {
            return;
          }

          newOrder.childOrders.sort((a, b) => a.paint.nc12.localeCompare(b.paint.nc12));

          newOrder.paint = newOrder.childOrders[0].paint;
        });

        setImmediate(this.next());
      },
      function()
      {
        const newOrders = Array.from(this.newOrders.values());

        this.newOrders.clear();

        newOrders.forEach(newOrder =>
        {
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
            }
          });

          newOrder._id = createHash('md5').update(newOrder._id).digest('hex').toUpperCase();

          this.newOrders.set(newOrder._id, newOrder);

          newOrderIds.push(newOrder._id);

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
        const newOrders = Array.from(this.newOrders.values());

        newOrders.sort((a, b) =>
        {
          const cmp = a.paint.nc12.localeCompare(b.paint.nc12);

          if (cmp !== 0)
          {
            return cmp;
          }

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
        });

        newOrders.forEach((newOrder, i) =>
        {
          newOrder.no = i + 1;
        });

        setImmediate(this.next());
      },
      function()
      {
        this.changes = {
          added: [],
          changed: [],
          removed: []
        };

        this.oldOrders.forEach(oldOrder =>
        {
          const newOrder = this.newOrders.get(oldOrder._id);

          this.newOrders.delete(oldOrder._id);

          if (!newOrder || newOrder.childOrders.length === 0)
          {
            return this.changes.removed.push(oldOrder._id);
          }

          const changed = compareOrders(oldOrder, newOrder);

          if (changed)
          {
            this.changes.changed.push(changed);
          }
        });

        this.newOrders.forEach(newOrder =>
        {
          if (newOrder.childOrders.length)
          {
            this.changes.added.push(newOrder);
          }
        });

        setImmediate(this.next());
      },
      function()
      {
        const {added, changed, removed} = this.changes;

        if (added.length)
        {
          PaintShopOrder.collection.insertMany(added, {ordered: false}, this.group());
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
        }
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
};
