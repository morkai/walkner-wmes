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

  app.onModuleReady(
    module.config.mongooseId,
    () => app.broker.subscribe('paintShop.events.saved', savePaintShopComment)
  );

  function savePaintShopComment(paintShopEvent)
  {
    const comment = paintShopEvent.data.comment || '';

    if (_.isEmpty(comment.replace(/[^A-Za-z0-9]+/g, '')))
    {
      return;
    }

    const mongoose = app[module.config.mongooseId];
    const PaintShopOrder = mongoose.model('PaintShopOrder');
    const Order = mongoose.model('Order');

    step(
      function()
      {
        PaintShopOrder.findById(paintShopEvent.order, {order: 1}).lean().exec(this.next());
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

        this.orderNo = paintShopOrder.order;
        this.change = {
          time: paintShopEvent.time,
          user: paintShopEvent.user,
          oldValues: {},
          newValues: {},
          comment: comment,
          source: 'ps'
        };

        Order.collection.update({_id: this.orderNo}, {$push: {changes: this.change}}, this.next());
      },
      function(err)
      {
        if (err)
        {
          return module.error(`Failed to save paint shop comment [${paintShopEvent._id}]: ${err.message}`);
        }

        app.broker.publish(`orders.updated.${this.orderNo}`, {
          _id: this.orderNo,
          change: this.change
        });
      }
    );
  }
};
