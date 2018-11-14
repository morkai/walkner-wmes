// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const step = require('h5.step');
const editOrder = require('./editOrder');
const setUpOrdersRoutes = require('./ordersRoutes');
const setUpMechOrdersRoutes = require('./mechOrdersRoutes');
const setUpEmptyOrdersRoutes = require('./emptyOrdersRoutes');
const setUpInvalidOrdersRoutes = require('./invalidOrdersRoutes');
const setUpPkhdStrategiesRoutes = require('./pkhdStrategiesRoutes');
const setUpOperationGroups = require('./operationGroups');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  iptCheckerClientId: 'messenger/client',
  importPath: './',
  zintExe: 'zint'
};

exports.start = function startOrdersModule(app, module)
{
  module.editOrder = editOrder.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
    ],
    function()
    {
      setUpOrdersRoutes(app, module);
      setUpMechOrdersRoutes(app, module);
      setUpEmptyOrdersRoutes(app, module);
      setUpInvalidOrdersRoutes(app, module);
      setUpPkhdStrategiesRoutes(app, module);
    }
  );

  app.onModuleReady(
    module.config.settingsId,
    setUpOperationGroups.bind(null, app, module)
  );

  app.onModuleReady([module.config.mongooseId, module.config.expressId], () =>
  {
    app.broker.subscribe('paintShop.events.saved', e => updatePsStatus(e, null));
    app.broker.subscribe('paintShop.orders.changed.*', onPaintShopChanged);
  });

  function updatePsStatus(paintShopEvent, done)
  {
    const mongoose = app[module.config.mongooseId];
    const PaintShopOrder = mongoose.model('PaintShopOrder');
    const Order = mongoose.model('Order');

    step(
      function()
      {
        PaintShopOrder
          .findById(paintShopEvent.order, {status: 1, order: 1, qty: 1, qtyDone: 1})
          .lean()
          .exec(this.next());
      },
      function(err, paintShopOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!paintShopOrder)
        {
          return this.skip(app.createError('PAINT_SHOP_ORDER_NOT_FOUND'));
        }

        let comment = paintShopEvent.data.comment || '';

        if (_.isEmpty(comment.replace(/[^A-Za-z0-9]+/g, '')))
        {
          comment = resolvePaintShopComment(paintShopOrder);
        }

        this.newStatus = paintShopOrder.status;
        this.orderNo = paintShopOrder.order;
        this.eventChange = {
          time: paintShopEvent.time,
          user: paintShopEvent.user,
          oldValues: {},
          newValues: {},
          comment: comment,
          source: 'ps'
        };

        Order
          .findOne({_id: this.orderNo}, {_id: 1, leadingOrder: 1, psStatus: 1})
          .lean()
          .exec(this.next());
      },
      function(err, eventSapOrder)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!eventSapOrder)
        {
          return this.skip(app.createError(`Event SAP order not found: ${err.message}`));
        }

        if (!eventSapOrder.leadingOrder)
        {
          return setImmediate(this.next(), null, [eventSapOrder]);
        }

        Order
          .find(
            {$or: [
              {_id: eventSapOrder.leadingOrder},
              {leadingOrder: eventSapOrder.leadingOrder}
            ]},
            {_id: 1, leadingOrder: 1, psStatus: 1}
          )
          .lean()
          .exec(this.next());
      },
      function(err, sapOrders)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to find SAP orders: ${err.message}`));
        }

        this.eventSapOrder = sapOrders.find(o => o._id === this.orderNo);

        if (this.newStatus !== this.eventSapOrder.psStatus)
        {
          this.eventChange.oldValues.psStatus = this.eventSapOrder.psStatus;
          this.eventChange.newValues.psStatus = this.newStatus;
        }

        this.leadingSapOrder = sapOrders.find(o => o._id === o.leadingOrder);

        if (this.eventSapOrder === this.leadingSapOrder)
        {
          return setImmediate(this.next(), null, []);
        }

        PaintShopOrder
          .find({order: {$in: sapOrders.map(o => o._id)}}, {status: 1})
          .lean()
          .exec(this.next());
      },
      function(err, psOrders)
      {
        if (err)
        {
          return this.skip(app.createError(`Failed to find PS orders: ${err.message}`));
        }

        const eventChange = this.eventChange;
        const eventUpdate = {
          $push: {changes: this.eventChange}
        };

        if (Object.keys(eventChange.newValues).length)
        {
          eventUpdate.$set = eventChange.newValues;
        }
        else if (!eventChange.user.id)
        {
          this.eventChange = null;
        }

        if (this.eventChange)
        {
          Order.collection.updateOne({_id: this.orderNo}, eventUpdate, this.group());
        }

        if (!psOrders.length || !this.leadingSapOrder)
        {
          return;
        }

        const statuses = {
          new: 0,
          started: 0,
          partial: 0,
          finished: 0,
          cancelled: 0
        };

        psOrders.forEach(o => statuses[o.status] += 1);

        const oldStatus = this.leadingSapOrder.psStatus;
        let newStatus = 'new';

        if (statuses.partial)
        {
          newStatus = 'partial';
        }
        else if (statuses.started)
        {
          newStatus = 'started';
        }
        else if (statuses.finished)
        {
          newStatus = (statuses.finished + statuses.cancelled) === psOrders.length ? 'finished' : 'partial';
        }
        else if (statuses.cancelled === psOrders.length)
        {
          newStatus = 'cancelled';
        }

        if (newStatus === oldStatus)
        {
          return;
        }

        this.leadingChange = {
          time: paintShopEvent.time,
          user: paintShopEvent.user,
          oldValues: {status: oldStatus},
          newValues: {status: newStatus},
          comment: eventChange.comment,
          source: 'ps'
        };

        const leadingUpdate = {
          $push: {changes: this.leadingChange},
          $set: {psStatus: newStatus}
        };

        Order.collection.updateOne({_id: this.leadingSapOrder._id}, leadingUpdate, this.group());
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to save paint shop comment [${paintShopEvent._id}]: ${err.message}`);
        }
        else
        {
          if (this.eventChange)
          {
            app.broker.publish(`orders.updated.${this.orderNo}`, {
              _id: this.orderNo,
              change: this.eventChange
            });
          }

          if (this.leadingChange)
          {
            app.broker.publish(`orders.updated.${this.leadingSapOrder._id}`, {
              _id: this.leadingSapOrder._id,
              change: this.leadingChange
            });
          }
        }

        if (done)
        {
          done();
        }
      }
    );
  }

  function resolvePaintShopComment(pso)
  {
    switch (pso.status)
    {
      case 'new':
        return 'Zresetowano.';

      case 'started':
        return pso.qtyDone ? `Wznowiono. Pozostało ${pso.qty - pso.qtyDone} szt.` : 'Rozpoczęto.';

      case 'partial':
        return `Zakończono ${pso.qtyDone}/${pso.qty} szt.`;

      case 'finished':
        return 'Zakończono.';

      case 'cancelled':
        return 'Anulowano.';
    }
  }

  function onPaintShopChanged({changes})
  {
    const changedPsOrders = new Set();

    changes.added.forEach(o => changedPsOrders.add(o._id));
    changes.changed.forEach(o => changedPsOrders.add(o._id));
    changes.removed.forEach(o => changedPsOrders.add(o));

    const psEvent = {
      _id: null,
      type: null,
      time: new Date(),
      user: {
        id: null,
        label: 'System'
      },
      order: null,
      data: {}
    };

    updateNextPsStatus(psEvent, Array.from(changedPsOrders.values()));
  }

  function updateNextPsStatus(psEvent, sapOrderQueue, done)
  {
    psEvent.order = sapOrderQueue.shift();

    if (!psEvent.order)
    {
      return;
    }

    updatePsStatus(psEvent, () => updateNextPsStatus(psEvent, sapOrderQueue, done));
  }
};
