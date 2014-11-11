// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var format = require('util').format;
var step = require('h5.step');
var exec12 = require('./exec12').exec;

module.exports = function renderLabelHtmlRoute(app, poModule, req, res, next)
{
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  var barcode = PurchaseOrder.BARCODES[req.query.barcode] ? req.query.barcode : 'code128';
  var paper = PurchaseOrder.PAPERS[req.query.paper] ? req.query.paper : 'a4';
  var barcodeType = PurchaseOrder.BARCODES[barcode];
  var paperOptions = PurchaseOrder.PAPERS[paper];
  var barcodeOptions = paperOptions[barcode];
  var query = req.query;

  ['orderNo', 'nc12', 'quantity', 'itemNo', 'vendorNo', 'shippingNo'].forEach(function(param)
  {
    if (!Array.isArray(query[param]))
    {
      query[param] = [query[param]];
    }
  });

  var barcodeDataToPng = {};
  var pages = query.orderNo.map(function(orderNo, i)
  {
    var page = {
      orderNo: orderNo || '',
      nc12: query.nc12[i] || '',
      quantity: query.quantity[i] || '',
      itemNo: query.itemNo[i] || '',
      vendorNo: query.vendorNo[i] || '',
      shippingNo: query.shippingNo[i] || '',
      barcodeData: null,
      svg: null
    };

    var barcodeData = format('O%sP%sQ%sL%sS', page.orderNo, page.nc12, page.quantity, page.itemNo);

    if (barcodeData.length + page.shippingNo.length > barcodeOptions.maxLength)
    {
      barcodeData += page.shippingNo.substr(-1 * (barcodeOptions.maxLength - barcodeData.length));
    }
    else
    {
      barcodeData += page.shippingNo;
    }

    page.barcodeData = barcodeData;

    barcodeDataToPng[page.barcodeData] = null;

    return page;
  });
  var uniqueBarcodes = Object.keys(barcodeDataToPng);

  step(
    function()
    {
      for (var i = 0, l = uniqueBarcodes.length; i < l; ++i)
      {
        generateBarcode(poModule.config.zintExe, barcodeType, barcodeOptions.zint, uniqueBarcodes[i], this.group());
      }
    },
    function(err, barcodePngs)
    {
      if (err)
      {
        return this.done(next, err);
      }

      for (var i = 0, l = uniqueBarcodes.length; i < l; ++i)
      {
        barcodeDataToPng[uniqueBarcodes[i]] = barcodePngs[i];
      }

      pages.forEach(function(page)
      {
        page.png = barcodeDataToPng[page.barcodeData];
      });

      return res.render('purchaseOrders/' + paper, {
        paper: paper,
        barcode: barcode,
        pages: pages
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
