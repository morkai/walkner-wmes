// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const createHash = require('crypto').createHash;
const _ = require('lodash');
const step = require('h5.step');

module.exports = function addPrintsRoute(app, poModule, req, res, next)
{
  const express = app[poModule.config.expressId];
  const userModule = app[poModule.config.userId];
  const mongoose = app[poModule.config.mongooseId];
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  const orderId = req.params.orderId;

  if (poModule.lockedOrders[orderId])
  {
    return next(express.createHttpError('LOCKED'));
  }

  const paper = req.body.paper;
  const barcode = req.body.barcode;
  let items = !Array.isArray(req.body.items) ? [] : req.body.items;

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
    return _.isObject(item)
      && /^[0-9]{1,6}$/.test(item._id)
      && _.isNumber(item.packageQty)
      && _.isNumber(item.componentQty)
      && _.isNumber(item.remainingQty)
      && (item.packageQty * item.componentQty + item.remainingQty) > 0;
  });

  if (items.length === 0)
  {
    return next(express.createHttpError('INVALID_ITEMS'));
  }

  const shippingNo = _.isString(req.body.shippingNo)
    ? req.body.shippingNo.substr(0, 30).replace(/[^a-zA-Z0-9\/\\\.\-_: ]+$/g, '')
    : '';
  const printer = _.isString(req.body.printer) && req.body.printer.length ? req.body.printer : 'browser';
  const currentDate = new Date();
  const currentUserInfo = userModule.createUserInfo(req.session.user, req);

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

      const itemMap = {};

      _.forEach(po.items, function(item) { itemMap[+item._id] = item; });

      for (let i = 0, l = items.length; i < l; ++i)
      {
        const item = items[i];

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

      _.forEach(items, item =>
      {
        item.print = new PurchaseOrderPrint({
          key: this.key,
          purchaseOrder: this.po._id,
          vendor: this.po.vendor,
          item: item.model._id,
          nc12: item.model.nc12,
          printedAt: currentDate,
          printedBy: currentUserInfo,
          printer: printer,
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
      });
    },
    function handleCreatePoPrintsResultStep(err)
    {
      if (err)
      {
        poModule.error('Failed to create prints for PO [%s]: %s', this.po._id, err.message);

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
        poModule.error('Failed to save PO [%s] after modifying printed quantities: %s', this.po._id, err.message);

        return this.skip(err);
      }
    },
    function sendResponseStep(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const addedPrints = _.map(items, function(item) { return item.print.toJSON(); });

      res.json({
        printKey: this.key,
        prints: addedPrints
      });

      this.addedPrints = addedPrints;

      setImmediate(this.next());
    },
    function publishMessageStep(err)
    {
      delete poModule.lockedOrders[orderId];

      const po = this.po;
      this.po = null;

      if (err)
      {
        return next(err);
      }

      const changedItems = [];

      _.forEach(items, function(item)
      {
        changedItems.push({
          _id: item.model._id,
          printedQty: item.model.printedQty
        });
      });

      app.broker.publish('purchaseOrders.printed.' + po._id, {
        _id: po._id,
        printedQty: po.printedQty,
        changedItems: changedItems,
        addedPrints: this.addedPrints
      });
    }
  );
};
