// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var createHash = require('crypto').createHash;
var format = require('util').format;
var lodash = require('lodash');
var step = require('h5.step');

module.exports = function setUpPurchaseOrdersRoutes(app, poModule)
{
  var express = app[poModule.config.expressId];
  var auth = app[poModule.config.userId].auth;
  var mongoose = app[poModule.config.mongooseId];
  var httpServer = app[poModule.config.httpServerId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  var RE_SHIPPING_NO = /^[a-zA-Z0-9/\\.\- ]+$/;

  var canView = auth('PURCHASE_ORDERS:VIEW');

  express.get(
    '/purchaseOrders',
    canView,
    limitToVendor,
    express.crud.browseRoute.bind(null, app, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders/:id',
    canView,
    limitToVendor,
    express.crud.readRoute.bind(null, app, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders/:orderId/:itemId;print',
    canView,
    limitToVendor,
    renderLabelPdfRoute
  );

  express.post(
    '/purchaseOrders/:orderId/:itemId;print',
    canView,
    limitToVendor,
    renderLabelPdfRoute
  );

  express.get(
    '/purchaseOrders;renderLabelHtml',
    auth('LOCAL', 'PURCHASE_ORDERS:VIEW'),
    limitToVendor,
    renderLabelHtmlRoute
  );

  function limitToVendor(req, res, next)
  {
    var user = req.session.user;

    if (!user.vendor)
    {
      return next();
    }

    var selectors = req.rql.selector.args;
    var vendorTerm = lodash.find(selectors, function(term)
    {
      return term.name === 'eq' && term.args[0] === 'vendor';
    });

    if (!vendorTerm)
    {
      vendorTerm = {name: 'eq', args: ['vendor', null]};

      selectors.unshift(vendorTerm);
    }

    vendorTerm.args[1] = user.vendor;

    next();
  }

  function renderLabelPdfRoute(req, res, next)
  {
    step(
      function findPoStep()
      {
        PurchaseOrder.findById(req.params.orderId, {vendor: 1, items: 1}).lean().exec(this.next());
      },
      function buildQueryStep(err, po)
      {
        if (err)
        {
          return this.done(next, err);
        }

        if (!po)
        {
          err = new Error('PO_NOT_FOUND');
          err.status = 404;

          return this.done(next, err);
        }

        var item = po.items.filter(function(item) { return item._id === req.params.itemId; })[0];

        if (!item)
        {
          err = new Error('PO_ITEM_NOT_FOUND');
          err.status = 404;

          return this.done(next, err);
        }

        var orderNo = po._id;
        var nc12 = item.nc12;
        var vendorNo = po.vendor;
        var itemNo = item._id.replace(/^0+/, '');
        var shippingNo = RE_SHIPPING_NO.test(req.query.shippingNo) ? req.query.shippingNo : '0';

        var query = [];
        var re = /(?:([0-9]+)x)?([0-9]+)/g;
        var quantity = String(req.query.quantity);
        var matches;

        while ((matches = re.exec(quantity)) !== null)
        {
          var pageCount = parseInt(matches[1], 10) || 1;
          var pageQuantity = parseInt(matches[2], 10);

          if (pageCount === 0 || pageQuantity === 0)
          {
            continue;
          }

          for (var i = 0; i < pageCount; ++i)
          {
            query.push(
              'orderNo[]=' + orderNo,
              'nc12[]=' + nc12,
              'quantity[]=' + pageQuantity,
              'itemNo[]=' + itemNo,
              'vendorNo[]=' + vendorNo,
              'shippingNo[]=' + encodeURIComponent(shippingNo)
            );
          }
        }

        if (query.length === 0)
        {
          err = new Error('INVALID_QUANTITY');
          err.status = 400;

          return this.done(next, err);
        }

        query.push('qr=' + (req.query.qr === '1' || req.query.qr === '' ? '1' : '0'));

        this.query = query.join('&');
      },
      function checkCacheStep()
      {
        var cacheKey = createHash('md5').update(this.query).digest('hex');

        this.outputFile = path.join(poModule.config.pdfStoragePath, cacheKey + '.pdf');

        fs.exists(this.outputFile, this.next());
      },
      function checkCacheResultStep(exists)
      {
        if (exists)
        {
          return this.skip();
        }
      },
      function renderPdfStep()
      {
        var url = 'http://'
          + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : 'httpServer.config.host')
          + ':' + httpServer.config.port
          + '/purchaseOrders;renderLabelHtml'
          + '?' + this.query;

        var cmd = format(
          '"%s" -q -B 0 -L 20mm -R 20mm -T 20mm -O Landscape --disable-smart-shrinking --no-outline "%s" "%s"',
          poModule.config.wkhtmltopdfExe,
          url,
          this.outputFile
        );

        exec(cmd, this.next());
      },
      function sendResultsStep(err)
      {
        if (err)
        {
          return next(err);
        }

        if (req.method === 'GET')
        {
          return res.sendfile(this.outputFile);
        }

        res.end();
      }
    );
  }

  function renderLabelHtmlRoute(req, res, next)
  {
    var qr = req.query.qr === '1';
    var barcodeType = qr ? 58 : 20;
    var scale = qr ? 7 : 1;
    var params =  ['orderNo', 'nc12', 'quantity', 'itemNo', 'vendorNo'];
    var query = req.query;

    params.forEach(function(param)
    {
      if (!Array.isArray(query[param]))
      {
        query[param] = [query[param]];
      }

      query[param] = query[param].map(function(value) { return parseInt(value, 10); });
    });

    if (!Array.isArray(query.shippingNo))
    {
      query.shippingNo = [query.shippingNo];
    }

    var barcodeDataToSvg = {};
    var pages = query.orderNo.map(function(orderNo, i)
    {
      var page = {
        orderNo: orderNo || 0,
        nc12: query.nc12[i] || 0,
        quantity: query.quantity[i] || 0,
        itemNo: query.itemNo[i] || 0,
        vendorNo: query.vendorNo[i] || 0,
        shippingNo: RE_SHIPPING_NO.test(query.shippingNo[i]) ? query.shippingNo[i] : 0,
        barcodeData: null,
        svg: null
      };

      page.barcodeData = format(
        'O%sP%sQ%sL%sS%s',
        page.orderNo,
        page.nc12,
        page.quantity,
        page.itemNo,
        page.shippingNo
      );

      barcodeDataToSvg[page.barcodeData] = null;

      return page;
    });
    var uniqueBarcodes = Object.keys(barcodeDataToSvg);

    step(
      function()
      {
        for (var i = 0, l = uniqueBarcodes.length; i < l; ++i)
        {
          generateBarcode(barcodeType, scale, uniqueBarcodes[i], this.group());
        }
      },
      function(err, barcodeSvgs)
      {
        if (err)
        {
          return this.done(next, err);
        }

        for (var i = 0, l = uniqueBarcodes.length; i < l; ++i)
        {
          barcodeDataToSvg[uniqueBarcodes[i]] = barcodeSvgs[i];
        }

        pages.forEach(function(page)
        {
          page.svg = barcodeDataToSvg[page.barcodeData];
        });

        return res.render('poLabel', {pages: pages});
      }
    );
  }

  function generateBarcode(barcodeType, scale, barcodeData, done)
  {
    var cmd = format(
      '"%s" --barcode=%d --vers=5 --scale=%d --height=259 --notext --directsvg --data="%s"',
      poModule.config.zintExe,
      barcodeType,
      scale,
      barcodeData
    );

    exec(cmd, function(err, stdout)
    {
      if (err)
      {
        return done(err);
      }

      var svgTagIndex = typeof stdout === 'string' ? stdout.indexOf('<svg') : -1;

      if (svgTagIndex === -1)
      {
        return done(new Error('NO_BARCODE'));
      }

      return done(null, stdout.substr(svgTagIndex));
    });
  }
};
