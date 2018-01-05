// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
const deepEqual = require('deep-equal');
const ObjectId = require('mongoose').Types.ObjectId;
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

    editOrder(orderNo, data, userInfo, err =>
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
        req.body.forEach(data => editOrder(data._id, data, userInfo, this.group()));
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

  function editOrder(orderNo, data, userInfo, done)
  {
    if (_.isEmpty(data.comment))
    {
      data.comment = '';
    }

    if (!validateEditInput(data))
    {
      return done(app.createError('INPUT', 400));
    }

    data.comment = data.comment.trim();

    step(
      function findOrderStep()
      {
        const fields = {
          qtyMax: 1,
          delayReason: 1,
          whStatus: 1,
          whTime: 1,
          whDropZone: 1
        };

        Order.findById(orderNo, fields).lean().exec(this.next());
      },
      function editOrderStep(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return this.skip(app.createError('NOT_FOUND', 404));
        }

        const change = {
          time: new Date(),
          user: userInfo,
          oldValues: {},
          newValues: {},
          comment: data.comment,
          source: data.source || 'other'
        };
        const update = {
          $push: {changes: change}
        };

        const valuesToCheck = {
          qtyMax: {
            old: order.qtyMax && order.qtyMax[data.operationNo] || 0,
            new: data.qtyMax,
            value: value => Object.assign({}, order.qtyMax || {}, {[data.operationNo]: value}),
            change: value => ({operationNo: data.operationNo, value})
          },
          delayReason: {
            old: order.delayReason ? order.delayReason.toString() : '',
            new: data.delayReason,
            value: v => v === '' ? null : new ObjectId(v),
            change: v => v === '' ? null : new ObjectId(v)
          },
          whStatus: {
            old: order.whStatus,
            new: data.whStatus,
            value: v => v,
            change: v => v
          },
          whTime: {
            old: order.whTime,
            new: data.whTime ? new Date(data.whTime) : data.whTime,
            value: v => v,
            change: v => v
          },
          whDropZone: {
            old: order.whDropZone,
            new: data.whDropZone,
            value: v => v,
            change: v => v
          }
        };

        Object.keys(valuesToCheck).forEach(k =>
        {
          const values = valuesToCheck[k];

          if (values.new === undefined || deepEqual(values.new, values.old))
          {
            return;
          }

          if (!update.$set)
          {
            update.$set = {};
          }

          update.$set[k] = values.value(values.new);
          change.oldValues[k] = values.change(values.old);
          change.newValues[k] = values.change(values.new);
        });

        if (_.isEmpty(change.newValues) && !change.comment.length)
        {
          return this.skip();
        }

        this.change = change;

        Order.collection.update({_id: order._id}, update, this.next());
      },
      function sendResultsStep(err)
      {
        if (err)
        {
          return done(err);
        }

        if (this.change)
        {
          app.broker.publish(`orders.updated.${orderNo}`, {
            _id: orderNo,
            change: this.change
          });
        }

        done();
      }
    );
  }

  function validateEditInput(input)
  {
    const {comment, delayReason, qtyMax, operationNo, whStatus, whTime, whDropZone} = input;

    if (!_.isString(comment))
    {
      return false;
    }

    if (delayReason !== undefined
      && delayReason !== ''
      && !/^[a-f0-9]{24}$/.test(delayReason))
    {
      return false;
    }

    if (qtyMax !== undefined
      && (qtyMax < 0 || qtyMax > 9999 || !/^[0-9]{4}$/.test(operationNo)))
    {
      return false;
    }

    if (whStatus !== undefined && !_.isString(whStatus))
    {
      return false;
    }

    if (whTime !== undefined && whTime !== null && isNaN(Date.parse(whTime)))
    {
      return false;
    }

    if (whDropZone !== undefined && !_.isString(whDropZone))
    {
      return false;
    }

    return true;
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
