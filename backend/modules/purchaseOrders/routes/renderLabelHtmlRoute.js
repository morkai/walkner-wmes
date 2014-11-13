// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var format = require('util').format;
var lodash = require('lodash');
var step = require('h5.step');
var exec12 = require('../util/exec12').exec;

module.exports = function renderLabelHtmlRoute(app, poModule, req, res, next)
{
  var express = app[poModule.config.expressId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');
  var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  step(
    function findPoPrintsStep()
    {
      if (req.query.key)
      {
        PurchaseOrderPrint.find({key: req.query.key}).sort({item: 1}).lean().exec(this.next());
      }
      else if (req.query.id)
      {
        PurchaseOrderPrint.find({_id: req.query.id}).lean().exec(this.next());
      }
    },
    function prepareQueryStep(err, poPrints)
    {
      if (!req.query.key && !req.query.id)
      {
        return;
      }

      if (err)
      {
        return this.skip(err);
      }

      if (!poPrints.length)
      {
        return this.skip(express.createHttpError('NO_PO_PRINTS', 400));
      }

      req.query = {
        barcode: poPrints[0].barcode,
        paper: poPrints[0].paper,
        orderNo: [],
        nc12: [],
        quantity: [],
        itemNo: [],
        vendorNo: [],
        shippingNo: []
      };

      lodash.forEach(poPrints, function(poPrint)
      {
        var itemNo = String(+poPrint.item);

        for (var i = 0; i < poPrint.packageQty; ++i)
        {
          req.query.orderNo.push(poPrint.purchaseOrder);
          req.query.nc12.push(poPrint.nc12);
          req.query.quantity.push(poPrint.componentQty);
          req.query.itemNo.push(itemNo);
          req.query.vendorNo.push(poPrint.vendor);
          req.query.shippingNo.push(poPrint.shippingNo);
        }

        if (poPrint.remainingQty > 0)
        {
          req.query.orderNo.push(poPrint.purchaseOrder);
          req.query.nc12.push(poPrint.nc12);
          req.query.quantity.push(poPrint.remainingQty);
          req.query.itemNo.push(itemNo);
          req.query.vendorNo.push(poPrint.vendor);
          req.query.shippingNo.push(poPrint.shippingNo);
        }
      });
    },
    function prepareBarcodesStep()
    {
      this.barcode = PurchaseOrder.BARCODES[req.query.barcode] ? req.query.barcode : 'code128';
      this.paper = PurchaseOrder.PAPERS[req.query.paper] ? req.query.paper : 'a4';
      this.barcodeType = PurchaseOrder.BARCODES[this.barcode];
      this.barcodeOptions = PurchaseOrder.PAPERS[this.paper][this.barcode];

      var query = req.query;

      lodash.forEach(['orderNo', 'nc12', 'quantity', 'itemNo', 'vendorNo', 'shippingNo'], function(param)
      {
        if (!Array.isArray(query[param]))
        {
          query[param] = [query[param]];
        }
      });

      this.barcodeDataToPng = {};
      this.pages = lodash.map(query.orderNo, function(orderNo, i)
      {
        var page = {
          orderNo: orderNo || '',
          nc12: query.nc12[i] || '',
          quantity: query.quantity[i] || '',
          itemNo: query.itemNo[i] || '',
          vendorNo: query.vendorNo[i] || '',
          shippingNo: query.shippingNo[i] || '',
          barcodeData: null,
          png: null
        };

        var barcodeData = format('O%sP%sQ%sL%sS', page.orderNo, page.nc12, page.quantity, page.itemNo);

        if (barcodeData.length + page.shippingNo.length > this.barcodeOptions.maxLength)
        {
          barcodeData += page.shippingNo.substr(-1 * (this.barcodeOptions.maxLength - barcodeData.length));
        }
        else
        {
          barcodeData += page.shippingNo;
        }

        page.barcodeData = barcodeData;

        this.barcodeDataToPng[barcodeData] = null;

        return page;
      }, this);
      this.uniqueBarcodes = Object.keys(this.barcodeDataToPng);
    },
    function generateBarcodesStep()
    {
      for (var i = 0, l = this.uniqueBarcodes.length; i < l; ++i)
      {
        generateBarcode(
          poModule.config.zintExe,
          this.barcodeType,
          this.barcodeOptions.zint,
          this.uniqueBarcodes[i],
          this.group()
        );
      }
    },
    function renderLabelHtmlStep(err, barcodePngs)
    {
      if (err)
      {
        return this.done(next, err);
      }

      lodash.forEach(this.uniqueBarcodes, function(uniqueBarcode, i)
      {
        this.barcodeDataToPng[uniqueBarcode] = barcodePngs[i];
      }, this);

      lodash.forEach(this.pages, function(page)
      {
        page.png = this.barcodeDataToPng[page.barcodeData];
      }, this);

      return res.render('purchaseOrders/' + this.paper, {
        paper: this.paper,
        barcode: this.barcode,
        pages: this.pages
      });
    }
  );
};

function generateBarcode(zintExe, barcodeType, barcodeOptions, barcodeData, done)
{
  var cmd = format(
    '"%s" --barcode=%d %s --notext --directpng --data="%s"',
    zintExe,
    barcodeType,
    barcodeOptions,
    barcodeData
  );

  exec12(cmd, {encoding: 'buffer'}, function(err, stdout)
  {
    if (err)
    {
      return done(err);
    }

    return done(null, stdout.toString('base64'));
  });
}
