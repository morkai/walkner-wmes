// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs-extra');
const moment = require('moment');
const step = require('h5.step');

module.exports = function setUpWhState(app, module)
{
  const settingsModule = app[module.config.settingsId];
  const html2pdf = app[module.config.html2pdfId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');
  const WhUser = mongoose.model('WhUser');
  const WhOrder = mongoose.model('WhOrder');
  const PaintShopOrder = mongoose.model('PaintShopOrder');
  const Printer = mongoose.model('Printer');
  const Order = mongoose.model('Order');

  const actions = {};
  let queue = null;

  module.state = {
    act: function(input, done)
    {
      if (typeof actions[input.action] !== 'function')
      {
        return done(app.createError(`Unknown action: ${input.action}`, 'UNKNOWN_ACTION', 400));
      }

      if (queue !== null)
      {
        queue.push({input, done});

        return;
      }

      queue = [{input, done}];

      setImmediate(executeNextAction);
    }
  };

  actions.resolveAction = (data, done) =>
  {
    step(
      function resolveUserStep()
      {
        resolveUser(data.personnelId, this.next());
      },
      function handleResultUserStep(err, user)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!user)
        {
          return this.skip(app.createError('User not found.', 'USER_NOT_FOUND', 400));
        }

        this.user = user;
      },
      function findActiveOrderStep()
      {
        const funcIndex = WhOrder.FUNCS.indexOf(this.user.func);

        WhOrder
          .findOne({
            date: data.date,
            status: 'started',
            [`funcs.${funcIndex}.user.id`]: this.user._id,
            [`funcs.${funcIndex}.status`]: {$nin: ['problem', 'finished']}
          })
          .lean()
          .exec(this.parallel());

        WhOrder
          .findOne({
            date: data.date,
            status: 'started',
            [`funcs.${funcIndex}.user`]: null
          })
          .lean()
          .exec(this.parallel());
      },
      function handleFindActiveOrderStep(err, assignedOrder, activeOrder)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find active order: ${err.message}`,
            'FIND_ACTIVE_ORDER_FAILURE'
          ));
        }

        if (assignedOrder)
        {
          continueSet(this.user, assignedOrder.set, this.next());
        }
        else if (activeOrder)
        {
          assignSet(this.user, activeOrder, this.next());
        }
        else
        {
          startNewSet(this.user, data.date, this.next());
        }
      },
      done
    );
  };

  actions.resetOrders = (data, done) =>
  {
    step(
      function()
      {
        const conditions = {
          date: data.date
        };

        if (data.orders)
        {
          conditions._id = {$in: data.orders};
        }
        else if (data.set)
        {
          conditions.set = data.set;
        }

        WhOrder.find(conditions).lean().exec(this.next());
      },
      function(err, orders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find orders to reset: ${err.message}`,
            'FIND_RESET_ORDERS_FAILURE'
          ));
        }

        this.orders = [];

        if (!orders.length)
        {
          return this.skip();
        }

        const $set = {};

        orders.forEach(order =>
        {
          $set.status = order.status = 'pending';
          $set.problem = order.problem = '';
          $set.set = order.set = null;
          $set.startedAt = order.startedAt = null;
          $set.finishedAt = order.finishedAt = null;
          $set.picklistFunc = order.picklistFunc = null;
          $set.picklistDone = order.picklistDone = null;
          $set.users = order.users = [];

          order.funcs.forEach((func, i) =>
          {
            $set[`funcs.${i}.user`] = func.user = null;
            $set[`funcs.${i}.startedAt`] = func.startedAt = null;
            $set[`funcs.${i}.finishedAt`] = func.finishedAt = null;
            $set[`funcs.${i}.status`] = func.status = 'pending';
            $set[`funcs.${i}.picklist`] = func.picklist = 'pending';
            $set[`funcs.${i}.pickup`] = func.pickup = 'pending';
            $set[`funcs.${i}.carts`] = func.carts = [];
            $set[`funcs.${i}.problemArea`] = func.problemArea = '';
            $set[`funcs.${i}.comment`] = func.comment = '';
          });
        });

        this.orders = orders;

        WhOrder.updateMany({_id: {$in: orders.map(o => o._id)}}, {$set}, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to reset orders: ${err.message}`,
            'RESET_ORDERS_FAILURE'
          ));
        }
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        if (this.orders.length)
        {
          app.broker.publish('wh.orders.updated', {orders: this.orders});
        }

        done(null, {orders: this.orders.map(o => o._id)});
      }
    );
  };

  actions.cancelOrders = (data, done) =>
  {
    step(
      function()
      {
        const conditions = {
          date: data.date
        };

        if (data.orders)
        {
          conditions._id = {$in: data.orders};
        }
        else if (data.set)
        {
          conditions.set = data.set;
        }

        WhOrder.find(conditions).lean().exec(this.next());
      },
      function(err, orders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find orders to cancel: ${err.message}`,
            'FIND_CANCEL_ORDERS_FAILURE'
          ));
        }

        this.orders = [];

        if (!orders.length)
        {
          return this.skip();
        }

        const $set = {};

        orders.forEach(order =>
        {
          $set.status = order.status = 'cancelled';
          $set.finishedAt = order.finishedAt = new Date();
        });

        this.orders = orders;

        WhOrder.updateMany({_id: {$in: orders.map(o => o._id)}}, {$set}, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to cancel orders: ${err.message}`,
            'CANCEL_ORDERS_FAILURE'
          ));
        }
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        if (this.orders.length)
        {
          app.broker.publish('wh.orders.updated', {orders: this.orders});
        }

        done(null, {orders: this.orders.map(o => o._id)});
      }
    );
  };

  actions.updateOrder = (data, done) =>
  {
    const newOrder = data.order;

    if (!newOrder)
    {
      return done(app.createError(`Invalid input.`, 'INPUT', 400));
    }

    step(
      function()
      {
        WhOrder.findOne({_id: newOrder._id}).exec(this.next());
      },
      function(err, oldOrder)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find order for update: ${err.message}`,
            'UPDATE_FIND_ORDER_FAILURE'
          ));
        }

        if (!oldOrder)
        {
          return this.skip(app.createError(
            `Order not found: ${newOrder._id}`,
            'ORDER_NOT_FOUND',
            404
          ));
        }

        oldOrder.$set(newOrder);
        oldOrder.save(this.next());
      },
      function(err, order)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to update order: ${err.message}`,
            'UPDATE_ORDER_FAILURE'
          ));
        }

        this.order = order;
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish('wh.orders.updated', {orders: [this.order]});

        done(null, {order: this.order});
      }
    );
  };

  actions.printLabels = (data, done) =>
  {
    if (typeof data.qty !== 'number' || data.qty < 1 || data.qty > 10)
    {
      return done(app.createError(`Invalid label quantity: ${data.qty}`, 'INPUT', 400));
    }

    step(
      function()
      {
        WhOrder.findById(data.order).lean().exec(this.next());
      },
      function(err, whOrder)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find order for printing: ${err.message}`,
            'PRINT_FIND_ORDER_FAILURE'
          ));
        }

        if (!whOrder)
        {
          return this.skip(app.createError(
            `Order not found: ${data.order}`,
            'PRINT_ORDER_NOT_FOUND',
            404
          ));
        }

        printLabels([whOrder], data.qty, this.next());
      },
      done
    );
  };

  function executeNextAction()
  {
    const next = queue.shift();

    actions[next.input.action](next.input.data, (err, res) =>
    {
      next.done(err, res);

      if (queue.length)
      {
        setImmediate(executeNextAction);
      }
      else
      {
        queue = null;
      }
    });
  }

  function resolveUser(personnelId, done)
  {
    step(
      function()
      {
        const conditions = {
          $or: [
            {personellId: personnelId},
            {card: personnelId},
            {cardUid: personnelId}
          ]
        };

        User.findOne(conditions, {_id: 1}).lean().exec(this.next());
      },
      function(err, user)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find user: ${err.message}`,
            'RESOLVE_USER_FAILURE'
          ));
        }

        if (!user)
        {
          return this.skip(null, null);
        }

        WhUser.findOne({_id: user._id.toString()}).lean().exec(this.next());
      },
      function(err, whUser)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find WH user: ${err.message}`,
            'RESOLVE_WH_USER_FAILURE'
          ));
        }

        if (!whUser)
        {
          return this.skip(null, null);
        }

        return this.skip(null, whUser);
      },
      done
    );
  }

  function continueSet(user, set, done)
  {
    done(null, {result: 'continueSet', set, user});
  }

  function assignSet(user, activeOrder, done)
  {
    step(
      function()
      {
        WhOrder
          .find({
            date: activeOrder.date,
            set: activeOrder.set
          })
          .sort({startTime: 1})
          .lean()
          .exec(this.next());
      },
      function(err, orders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find orders for assignment: ${err.message}`,
            'FIND_ASSIGN_ORDERS_FAILURE'
          ));
        }

        const $set = {};

        orders.forEach(order =>
        {
          $set.users = order.users = order.users.concat([user._id]);

          const func = order.funcs.find(f => f._id === user.func);
          const funcI = order.funcs.indexOf(func);

          $set[`funcs.${funcI}.user`] = func.user = {id: user._id, label: user.label};
          $set[`funcs.${funcI}.startedAt`] = func.startedAt = new Date();
          $set[`funcs.${funcI}.status`] = func.status = 'picklist';
        });

        this.orders = orders;

        WhOrder.collection.updateMany({_id: {$in: orders.map(o => o._id)}}, {$set}, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to update new set: ${err.message}`,
            'ASSIGN_SET_UPDATE_FAILURE'
          ));
        }
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish('wh.orders.updated', {orders: this.orders});

        done(null, {
          result: 'assignedToSet',
          orders: this.orders,
          user
        });

        printLabels(this.orders, 1, err =>
        {
          if (err)
          {
            module.error(`Failed to print labels after set assignment: ${err.message}`);
          }
        });
      }
    );
  }

  function startNewSet(user, date, done)
  {
    step(
      function()
      {
        findNextPendingOrder(date, [], this.next());
      },
      function(err, pendingOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        findMorePendingOrders(pendingOrder, this.parallel());

        findNextSetId(date, this.parallel());
      },
      function(err, orders, set)
      {
        if (err)
        {
          return this.skip(err);
        }

        const startedAt = new Date();
        const $set = {};

        orders.forEach(order =>
        {
          $set.status = order.status = 'started';
          $set.set = order.set = set;
          $set.startedAt = order.startedAt = startedAt;
          $set.picklistFunc = order.picklistFunc = user.func;
          $set.picklistDone = order.picklistDone = null;
          $set.users = order.users = [user._id];

          const func = order.funcs.find(f => f._id === user.func);
          const funcI = order.funcs.indexOf(func);

          $set[`funcs.${funcI}.user`] = func.user = {id: user._id, label: user.label};
          $set[`funcs.${funcI}.startedAt`] = func.startedAt = startedAt;
          $set[`funcs.${funcI}.status`] = func.status = 'picklist';
        });

        this.orders = orders;

        WhOrder.collection.updateMany({_id: {$in: orders.map(o => o._id)}}, {$set}, this.next());
      },
      function(err)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to update new set: ${err.message}`,
            'NEW_SET_UPDATE_FAILURE'
          ));
        }
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        app.broker.publish('wh.orders.updated', {orders: this.orders});

        done(null, {
          result: 'newSetStarted',
          orders: this.orders,
          user
        });

        printLabels(this.orders, 1, err =>
        {
          if (err)
          {
            module.error(`Failed to print labels after set start: ${err.message}`);
          }
        });
      }
    );
  }

  function findNextPendingOrder(date, ignore, done)
  {
    step(
      function()
      {
        const conditions = {
          status: 'pending',
          date
        };

        if (ignore.length)
        {
          conditions._id = {$nin: ignore};
        }

        const sort = {
          group: 1,
          line: 1,
          startTime: 1
        };

        WhOrder
          .findOne(conditions)
          .sort(sort)
          .lean()
          .exec(this.next());
      },
      function(err, whOrder)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find next pending order: ${err.message}`,
            'FIND_PENDING_FAILURE'
          ));
        }

        if (!whOrder)
        {
          return this.skip(app.createError(
            'No valid, pending orders.',
            'NO_PENDING_ORDERS'
          ));
        }

        this.whOrder = whOrder;

        PaintShopOrder
          .find({order: whOrder.order, status: {$ne: 'finished'}}, {_id: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, psOrders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find PS orders: ${err.message}`,
            'FIND_PS_ORDERS_FAILURE'
          ));
        }

        if (psOrders.length)
        {
          ignore.push(this.whOrder._id);

          this.whOrder = null;
        }
      },
      function(err)
      {
        if (err)
        {
          return done(err);
        }

        if (this.whOrder)
        {
          return done(null, this.whOrder);
        }

        setImmediate(findNextPendingOrder, date, ignore, done);
      }
    );
  }

  function findMorePendingOrders(pendingOrder, done)
  {
    step(
      function()
      {
        settingsModule.findValues({_id: /^wh\.planning/}, 'wh.planning.', this.parallel());
      },
      function(err, settings)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find settings: ${err.message}`,
            'FIND_SETTINGS_FAILURE'
          ));
        }

        this.maxSetSize = settings.maxSetSize || 5;

        const conditions = {
          status: 'pending',
          date: pendingOrder.date,
          line: pendingOrder.line,
          group: pendingOrder.group
        };

        WhOrder
          .find(conditions)
          .sort({startTime: 1})
          .lean()
          .exec(this.next());
      },
      function(err, pendingOrders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find more pending orders: ${err.message}`,
            'FIND_PENDING_FAILURE'
          ));
        }

        this.pendingOrders = pendingOrders;

        const conditions = {
          order: {
            $in: pendingOrders.map(o => o.order)
          },
          status: {
            $ne: 'finished'
          }
        };

        PaintShopOrder
          .find(conditions, {order: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, psOrders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find more PS orders: ${err.message}`,
            'FIND_PS_ORDERS_FAILURE'
          ));
        }

        const psOrderSet = new Set(psOrders.map(o => o.order));
        const whOrders = this.pendingOrders.filter(o => !psOrderSet.has(o.order));
        const set = whOrders.slice(0, this.maxSetSize);

        this.skip(null, set);
      },
      done
    );
  }

  function findNextSetId(date, done)
  {
    const pipeline = [
      {$match: {date}},
      {$group: {_id: null, set: {$max: '$set'}}}
    ];

    WhOrder.aggregate(pipeline, (err, result) =>
    {
      if (err)
      {
        return done(app.createError(
          `Failed to find next set ID: ${err.message}`,
          'FIND_SET_ID_FAILURE'
        ));
      }

      done(null, (result[0].set || 0) + 1);
    });
  }

  function printLabels(whOrders, labelQty, done)
  {
    step(
      function()
      {
        fs.readFile(`${__dirname}/templates/label.prn`, 'utf8', this.parallel());

        Printer
          .findOne({tags: 'wh/cart'}, {_id: 1})
          .lean()
          .exec(this.parallel());

        Order
          .find({_id: {$in: whOrders.map(o => o.order)}}, {nc12: 1, qty: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, template, printer, sapOrders)
      {
        if (err)
        {
          return this.skip(app.createError(
            `Failed to find print data: ${err.message}`,
            'FIND_PRINT_DATA_FAILURE'
          ));
        }

        if (!printer)
        {
          return this.skip(app.createError('No wh/cart printer!', 'PRINT_FAILURE'));
        }

        const time = moment().format('DD.MM.YYYY, HH:mm');
        const zpl = whOrders.map(whOrder =>
        {
          const sapOrder = sapOrders.find(o => o._id === whOrder.order) || {
            nc12: '000000000000',
            qty: 0
          };

          return compileZpl(template, {
            labelQty,
            time,
            line: whOrder.line,
            order: whOrder.order,
            nc12: sapOrder.nc12,
            qtyPlan: whOrder.qty,
            qtyTodo: sapOrder.qty
          });
        });

        html2pdf.printZpl(zpl.join('\r\n'), printer._id, this.next());
      },
      function(err)
      {
        if (err)
        {
          return done(app.createError(
            `Failed to print labels: ${err.message}`,
            'PRINT_FAILURE'
          ));
        }
      },
      done
    );
  }

  function compileZpl(zpl, data)
  {
    const templateData = {
      DLE: '\u0010',
      TIME: data.time,
      LINE: e(data.line),
      ORDER_NO: data.order,
      NC12: data.nc12,
      QTY_PLAN: data.qtyPlan,
      QTY_TODO: data.qtyTodo,
      BARCODE_X: [40, 184, 145, 107, 40][data.qtyPlan.toString().length],
      LABEL_QTY: data.labelQty
    };

    Object.keys(templateData).forEach(key =>
    {
      zpl = zpl.replace(new RegExp('\\$\\{' + key + '\\}', 'g'), templateData[key]);
    });

    return zpl;
  }

  function e(v)
  {
    return (v || '').replace('~', '\\7e');
  }
};
