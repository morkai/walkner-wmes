// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const step = require('h5.step');
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

  const canView = userModule.auth('ORDERS:VIEW');
  const canPrint = userModule.auth('LOCAL', 'ORDERS:VIEW');
  const canManage = userModule.auth('ORDERS:MANAGE');

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

  express.get('/orders/:id.html', canPrint, renderHtmlOrderRoute.bind(null, app, ordersModule));

  express.get('/orders/:id', express.crud.readRoute.bind(null, app, Order));

  express.post('/orders/:id', canManage, editOrderRoute);

  function editOrderRoute(req, res, next)
  {
    const data = _.pick(req.body, ['delayReason', 'comment']);

    if (_.isEmpty(data.delayReason))
    {
      data.delayReason = '';
    }

    if (_.isEmpty(data.comment))
    {
      data.comment = '';
    }

    if (!_.isString(data.delayReason)
      || !_.isString(data.comment)
      || (data.delayReason !== '' && !/^[a-f0-9]{24}$/.test(data.delayReason)))
    {
      return next(express.createHttpError('INPUT', 400));
    }

    data.comment = data.comment.trim();

    step(
      function findOrderStep()
      {
        Order.findById(req.params.id, {delayReason: 1}).lean().exec(this.next());
      },
      function editOrderStep(err, order)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!order)
        {
          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        let oldDelayReason = order.delayReason ? order.delayReason.toString() : '';
        let newDelayReason = data.delayReason;

        if (oldDelayReason === newDelayReason && !data.comment.length)
        {
          return this.skip(express.createHttpError('INPUT', 400));
        }

        const change = {
          time: new Date(),
          user: userModule.createUserInfo(req.session.user, req),
          oldValues: {},
          newValues: {},
          comment: data.comment
        };
        const update = {
          $push: {changes: change}
        };

        if (oldDelayReason !== newDelayReason)
        {
          oldDelayReason = oldDelayReason === '' ? null : new ObjectId(oldDelayReason);
          newDelayReason = newDelayReason === '' ? null : new ObjectId(newDelayReason);

          update.$set = {delayReason: newDelayReason};
          change.oldValues = {delayReason: oldDelayReason};
          change.newValues = {delayReason: newDelayReason};
        }
        else
        {
          newDelayReason = oldDelayReason;
        }

        this.newDelayReason = newDelayReason;
        this.change = change;

        Order.collection.update({_id: order._id}, update, this.next());
      },
      function sendResultsStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.sendStatus(204);

        app.broker.publish('orders.updated.' + req.params.id, {
          _id: req.params.id,
          delayReason: this.newDelayReason,
          change: this.change
        });
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
