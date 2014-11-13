// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var createHash = require('crypto').createHash;
var lodash = require('lodash');
var step = require('h5.step');

module.exports = function addPrintsRoute(app, poModule, req, res, next)
{
  var express = app[poModule.config.expressId];
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');
  var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  var orderId = req.params.orderId;

  if (poModule.lockedOrders[orderId])
  {
    return next(express.createHttpError('LOCKED'));
  }

  var paper = req.body.paper;
  var barcode = req.body.barcode;
  var items = !Array.isArray(req.body.items) ? [] : req.body.items;

  if (!PurchaseOrder.PAPERS[paper])
  {
    return next(express.createHttpError('INVALID_PAPER'));
  }

  if (!PurchaseOrder.BARCODES[barcode])
  {
    return next(express.createHttpError('INVALID_BARCODE'));
  }

  items = items.filter(function(item)
  {
    return lodash.isObject(item)
      && /^[0-9]{1,6}$/.test(item._id)
      && lodash.isNumber(item.packageQty)
      && lodash.isNumber(item.componentQty)
      && lodash.isNumber(item.remainingQty)
      && (item.packageQty * item.componentQty + item.remainingQty) > 0;
  });

  if (items.length === 0)
  {
    return next(express.createHttpError('INVALID_ITEMS'));
  }

  var shippingNo = lodash.isString(req.body.shippingNo)
    ? req.body.shippingNo.substr(0, 30).replace(/[^a-zA-Z0-9\/\\.\-: ]+$/g, '')
    : '';
  var currentDate = new Date();
  var currentUserInfo = userModule.createUserInfo(req.session.user, req);

  poModule.lockedOrders[orderId] = true;

  step(
    function findPoStep()
    {
      PurchaseOrder.findById(orderId).exec(this.next());
    },
    function handleFindPoResultStep(err, po)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!po)
      {
        return this.skip(express.createHttpError('PO_NOT_FOUND'));
      }

      var itemMap = {};

      lodash.forEach(po.items, function(item) { itemMap[+item._id] = item; }, this);

      for (var i = 0, l = items.length; i < l; ++i)
      {
        var item = items[i];

        item.model = itemMap[+item._id];

        if (!item.model)
        {
          return this.skip(express.createHttpError('ITEM_NOT_FOUND'));
        }
      }

      this.po = po;
    },
    function createPoPrintsStep()
    {
      this.key = createHash('md5').update(Date.now() + Math.random().toString()).digest('hex').toUpperCase();

      lodash.forEach(items, function(item)
      {
        item.print = new PurchaseOrderPrint({
          key: this.key,
          purchaseOrder: this.po._id,
          vendor: this.po.vendor,
          item: item.model._id,
          nc12: item.model.nc12,
          printedAt: currentDate,
          printedBy: currentUserInfo,
          paper: paper,
          barcode: barcode,
          shippingNo: shippingNo,
          packageQty: item.packageQty,
          componentQty: item.componentQty,
          remainingQty: item.remainingQty,
          totalQty: item.packageQty * item.componentQty + item.remainingQty
        });

        item.model.printedQty += item.print.totalQty;

        item.print.save(this.parallel());
      }, this);
    },
    function handleCreatePoPrintsResultStep(err)
    {
      if (err)
      {
        poModule.error("Failed to create prints for PO [%s]: %s", this.po._id, err.message);

        return this.skip(err);
      }
    },
    function saveModifiedPoStep()
    {
      this.po.markModified('items');
      this.po.save(this.next());
    },
    function handleSaveModifiedPoResultStep(err)
    {
      if (err)
      {
        poModule.error("Failed to save PO [%s] after modifying printed quantities: %s", this.po._id, err.message);

        return this.skip(err);
      }
    },
    function sendResponseStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      res.json(this.key);

      setImmediate(this.next());
    },
    function publishMessageStep(err)
    {
      delete poModule.lockedOrders[orderId];

      var po = this.po;
      this.po = null;

      if (err)
      {
        return next(err);
      }

      var changedItems = [];
      var addedPrints = [];

      lodash.forEach(items, function(item)
      {
        changedItems.push({
          _id: item.model._id,
          printedQty: item.model.printedQty
        });
        addedPrints.push(item.print.toJSON());
      });

      app.broker.publish('purchaseOrders.printed.' + po._id, {
        _id: po._id,
        printedQty: po.printedQty,
        changedItems: changedItems,
        addedPrints: addedPrints
      });
    }
  );
};
