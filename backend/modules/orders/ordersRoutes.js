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
  const DelayReason = mongoose.model('DelayReason');

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

  express.get('/orders', canView, express.crud.browseRoute.bind(null, app, Order));

  express.get(
    '/orders;export.:format?',
    canView,
    prepareExportDictionaries,
    function(req, res, next)
    {
      req.rql.fields = {
        bom: 0,
        changes: 0,
        documents: 0,
        operations: 0,
        qtyMax: 0,
        statusesSetAt: 0
      };
      req.rql.sort = {};

      next();
    },
    express.crud.exportRoute.bind(null, app, {
      filename: 'WMES-ORDERS',
      freezeRows: 1,
      freezeColumns: 1,
      columns: {
        orderNo: 10,
        nc12: 15,
        name: 40,
        description: 20,
        mrp: 5,
        todo: {type: 'integer', width: 5},
        done: {type: 'integer', width: 5},
        sapCreatedAt: 'datetime',
        leadingOrder: 12,
        salesOrder: 8,
        salesOrderItem: 5,
        soldToParty: 11,
        priority: 3,
        status: 40,
        delayReason: 15,
        '4m': 10,
        drm: 5,
        startDate: 'date',
        finishDate: 'date',
        scheduledStartDate: 'date',
        scheduledFinishDate: 'date',
        importedAt: 'datetime',
        updatedAt: 'datetime',
        enteredBy: 15,
        changedBy: 15
      },
      serializeRow: exportOrder,
      model: Order
    })
  );

  express.post('/orders', canEdit, editOrdersRoute);

  express.get('/orders/:id.html', canPrint, renderHtmlOrderRoute.bind(null, app, ordersModule));

  express.get('/orders/:id', canView, express.crud.readRoute.bind(null, app, {
    model: Order,
    prepareResult: (model, done) => Order.assignPkhdStrategies(model, done)
  }));

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

  function prepareExportDictionaries(req, res, next)
  {
    req.delayReasons = new Map();

    DelayReason.find().lean().exec((err, delayReasons) =>
    {
      if (err)
      {
        return next(err);
      }

      delayReasons.forEach(delayReason => req.delayReasons.set(delayReason._id.toString(), delayReason));

      next();
    });
  }

  function exportOrder(doc, req)
  {
    const delayReason = req.delayReasons.get(String(doc.delayReason));

    return {
      orderNo: doc._id,
      nc12: doc.nc12,
      name: doc.name,
      description: doc.name === doc.description ? '' : doc.description,
      mrp: doc.mrp,
      todo: doc.qty,
      done: doc.qtyDone && doc.qtyDone.total || 0,
      sapCreatedAt: doc.sapCreatedAt,
      leadingOrder: doc.leadingOrder,
      salesOrder: doc.salesOrder,
      salesOrderItem: doc.salesOrderItem,
      soldToParty: doc.soldToParty,
      priority: doc.priority,
      status: doc.statuses.join(' '),
      delayReason: delayReason ? delayReason.name : (doc.delayReason || ''),
      '4m': doc.m4,
      drm: delayReason ? delayReason.drm : '',
      startDate: doc.startDate,
      finishDate: doc.finishDate,
      scheduledStartDate: doc.scheduledStartDate,
      scheduledFinishDate: doc.scheduledFinishDate,
      importedAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      enteredBy: doc.enteredBy,
      changedBy: doc.changedBy
    };
  }
};
