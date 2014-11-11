// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');

module.exports = function togglePrintCancelRoute(app, poModule, req, res, next)
{
  var express = app[poModule.config.expressId];
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  PurchaseOrder.findById(req.params.orderId).exec(function(err, po)
  {
    if (err)
    {
      return next(err);
    }

    if (req.body.__v !== po.__v)
    {
      return next(express.createHttpError('VERSION_MISMATCH'));
    }

    var item = lodash.find(po.items, function(item) { return item._id === req.body.itemId; });

    if (!item)
    {
      return next(express.createHttpError('ITEM_NOT_FOUND'));
    }

    var printIndex = lodash.findIndex(item.prints, function(print) { return print._id === req.body.printId; });
    var print = item.prints[printIndex];

    if (!print)
    {
      return next(express.createHttpError('PRINT_NOT_FOUND'));
    }

    var newCancelled = !!req.body.cancelled;

    if (newCancelled === print.cancelled)
    {
      return res.end();
    }

    print.cancelled = newCancelled;
    print.cancelledBy = userModule.createUserInfo(req.session.user, req);
    print.cancelledAt = new Date();

    var change = {
      date: print.cancelledAt,
      user: print.cancelledBy,
      data: {}
    };
    var changedProperty = 'items/' + item._id + '/prints/' + printIndex + '/cancelled';

    change.data[changedProperty] = [!print.cancelled, print.cancelled];

    po.changes.push(change);

    po.save(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.send();

      app.broker.publish('purchaseOrders.cancelled.' + po._id, po.toJSON());
    });
  });
};
