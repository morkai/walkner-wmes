// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const renderHtmlOrderRoute = require('./routes/renderHtmlOrder');

module.exports = function setUpOrdersRoutes(app, ordersModule)
{
  const express = app[ordersModule.config.expressId];
  const userModule = app[ordersModule.config.userId];
  const settings = app[ordersModule.config.settingsId];
  const mongoose = app[ordersModule.config.mongooseId];
  const Order = mongoose.model('Order');
  const OrderZlf1 = mongoose.model('OrderZlf1');

  const canView = userModule.auth('LOCAL', 'ORDERS:VIEW');
  const canPrint = userModule.auth('LOCAL', 'ORDERS:VIEW');
  const canManage = userModule.auth('ORDERS:MANAGE');
  const canEdit = userModule.auth(
    'ORDERS:MANAGE',
    'PLANNING:PLANNER', 'PLANNING:WHMAN', 'PAINT_SHOP:PAINTER',
    'FN:master', 'FN:leader'
  );

  express.post('/orders;import', importOrdersRoute);

  express.get(
    '/orders/settings',
    canView,
    function limitToOrdersSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^orders\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/orders/settings/:id', canManage, settings.updateRoute);

  express.get('/orders/zlf1', canPrint, express.crud.browseRoute.bind(null, app, OrderZlf1));

  express.get('/orders/zlf1/:id', canPrint, express.crud.readRoute.bind(null, app, OrderZlf1));

  express.get('/orders', express.crud.browseRoute.bind(null, app, Order));

  express.post('/orders', canEdit, editOrdersRoute);

  express.get('/orders/:id.html', canPrint, renderHtmlOrderRoute.bind(null, app, ordersModule));

  express.get('/orders/:id', express.crud.readRoute.bind(null, app, Order));

  express.post('/orders/:id', canEdit, editOrderRoute);

  function editOrderRoute(req, res, next)
  {
    const orderNo = req.params.id;
    const data = req.body;
    const userInfo = userModule.createUserInfo(req.session.user, req);

    ordersModule.editOrder(orderNo, data, userInfo, err =>
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    });
  }

  function editOrdersRoute(req, res, next)
  {
    if (!Array.isArray(req.body) || !req.body.length)
    {
      return next(app.createError('INPUT', 400));
    }

    const userInfo = userModule.createUserInfo(req.session.user, req);

    step(
      function()
      {
        req.body.forEach(data => ordersModule.editOrder(data._id, data, userInfo, this.group()));
      },
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        res.sendStatus(204);
      }
    );
  }

  function importOrdersRoute(req, res, next)
  {
    res.type('text/plain');

    if (!req.is('text/plain'))
    {
      return res.status(400).send('INVALID_CONTENT_TYPE');
    }

    const fileName = req.query.fileName;
    const timestamp = parseInt(req.query.timestamp, 10);

    if (_.isEmpty(fileName) || !/\.txt$/.test(fileName) || isNaN(timestamp) || req.body.length < 256)
    {
      return res.status(400).send('INPUT');
    }

    const importFile = timestamp + '@' + fileName;

    fs.writeFile(path.join(ordersModule.config.importPath, importFile), req.body, function(err)
    {
      if (err)
      {
        return next(err);
      }

      return res.sendStatus(204);
    });
  }
};
