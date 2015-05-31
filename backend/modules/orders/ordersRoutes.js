// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');
var step = require('h5.step');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function setUpOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var userModule = app[ordersModule.config.userId];
  var settings = app[ordersModule.config.settingsId];
  var Order = app[ordersModule.config.mongooseId].model('Order');

  var canView = userModule.auth('ORDERS:VIEW');
  var canManage = userModule.auth('ORDERS:MANAGE');

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

  express.get('/orders', express.crud.browseRoute.bind(null, app, Order));

  express.get('/orders/:id', express.crud.readRoute.bind(null, app, Order));

  express.post('/orders/:id', canManage, editOrderRoute);

  function editOrderRoute(req, res, next)
  {
    var data = _.pick(req.body, ['delayReason', 'comment']);

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

        var oldDelayReason = order.delayReason ? order.delayReason.toString() : '';
        var newDelayReason = data.delayReason;

        if (oldDelayReason === newDelayReason && !data.comment.length)
        {
          return this.skip(express.createHttpError('INPUT', 400));
        }

        var change = {
          time: new Date(),
          user: userModule.createUserInfo(req.session.user, req),
          oldValues: {},
          newValues: {},
          comment: data.comment
        };
        var update = {
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
};
