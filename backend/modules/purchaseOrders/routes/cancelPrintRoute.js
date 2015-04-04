// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var lodash = require('lodash');
var step = require('h5.step');

module.exports = function cancelPrintRoute(app, poModule, req, res, next)
{
  var express = app[poModule.config.expressId];
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');
  var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  step(
    function findPoPrintsStep()
    {
      var conditions = {};

      conditions[req.params.printId.length === 32 ? 'key' : '_id'] = req.params.printId;

      PurchaseOrderPrint.find(conditions, this.next());
    },
    function findPoStep(err, poPrints)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!poPrints.length)
      {
        return this.skip(express.createHttpError('PO_PRINT_NOT_FOUND', 404));
      }

      this.poPrints = poPrints;

      PurchaseOrder.findById(poPrints[0].purchaseOrder, this.next());
    },
    function cancelStep(err, po)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.po = po;

      var cancelled = !!req.body.cancelled;
      var cancelledBy = userModule.createUserInfo(req.session.user, req);
      var cancelledAt = new Date();

      lodash.forEach(this.poPrints, function(poPrint)
      {
        poPrint.cancelled = cancelled;
        poPrint.cancelledBy = cancelledBy;
        poPrint.cancelledAt = cancelledAt;
        poPrint.save(this.parallel());
      }, this);
    },
    function updatePoStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      this.po.markModified('items');
      this.po.save(this.next());
    },
    function sendResponseStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      res.sendStatus(204);

      setImmediate(this.next());
    },
    function publishMessageStep(err)
    {
      var po = this.po;
      var poPrints = this.poPrints;

      this.po = null;
      this.poPrints = null;

      if (err)
      {
        return this.done(next, err);
      }

      var itemMap = {};

      lodash.forEach(po.items, function(item) { itemMap[item._id] = item.printedQty; });

      var changedItems = [];
      var changedPrints = [];

      lodash.forEach(poPrints, function(poPrint)
      {
        changedItems.push({
          _id: poPrint.item,
          printedQty: itemMap[poPrint.item]
        });
        changedPrints.push(poPrint._id);
      });

      app.broker.publish('purchaseOrders.cancelled.' + po._id, {
        _id: po._id,
        printedQty: po.printedQty,
        changedItems: changedItems,
        changedPrints: changedPrints,
        cancelData: {
          cancelled: poPrints[0].cancelled,
          cancelledBy: poPrints[0].cancelledBy,
          cancelledAt: poPrints[0].cancelledAt
        }
      });
    }
  );
};
