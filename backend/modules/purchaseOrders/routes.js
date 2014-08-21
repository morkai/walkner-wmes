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
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var httpServer = app[poModule.config.httpServerId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  var RE_INVALID_SHIPPING_NO = /[^a-zA-Z0-9\/\\.\-: ]+$/g;
  var lockedOrders = {};

  var canView = userModule.auth('PURCHASE_ORDERS:VIEW');
  var canManage = userModule.auth('PURCHASE_ORDERS:MANAGE');

  express.get(
    '/purchaseOrders',
    canView,
    limitToVendor,
    express.crud.browseRoute.bind(null, app, PurchaseOrder)
  );

  express.get(
    '/purchaseOrders;getLatestComponentQty',
    canManage,
    getLatestComponentQtyRoute
  );

  express.get(
    '/purchaseOrders/:id',
    canView,
    limitToVendor,
    express.crud.readRoute.bind(null, app, PurchaseOrder)
  );

  express.post(
    '/purchaseOrders/:orderId/prints;cancel',
    canManage,
    togglePrintCancelRoute
  );

  express.get(
    '/purchaseOrders/:orderId/prints/:printId',
    canView,
    getLabelPdfRoute
  );

  express.post(
    '/purchaseOrders/:orderId/prints',
    canManage,
    renderLabelPdfRoute
  );

  express.get(
    '/purchaseOrders;renderLabelHtml',
    userModule.auth('LOCAL', 'PURCHASE_ORDERS:MANAGE'),
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

  function getLatestComponentQtyRoute(req, res, next)
  {
    var nc12 = [].concat(req.query.nc12 || req.body.nc12).filter(function(nc12)
    {
      return typeof nc12 === 'string' && nc12.length === 12;
    });

    if (!nc12.length)
    {
      return res.json({});
    }

    PurchaseOrder.aggregate(
      {$match: {'items.nc12': {$in: nc12}}},
      {$unwind: '$items'},
      {$match: {'items.nc12': {$in: nc12}, 'items.prints': {$not: {$size: 0}}}},
      {$project: {_id: 0, nc12: '$items.nc12', prints: '$items.prints'}},
      {$unwind: '$prints'},
      {$match: {'prints.componentQty': {$ne: 0}}},
      {$group: {_id: '$nc12', print: {$last: '$prints'}}},
      {$project: {_id: 0, nc12: '$_id', componentQty: '$print.componentQty'}},
      function(err, results)
      {
        if (err)
        {
          return next(err);
        }

        var latestComponentQty = {};

        results.forEach(function(result)
        {
          latestComponentQty[result.nc12] = result.componentQty;
        });

        res.json(latestComponentQty);
      }
    );
  }

  function createHttpError(message, statusCode)
  {
    var err = new Error(message);
    err.status = statusCode || 400;

    return err;
  }

  function getLabelPdfRoute(req, res, next)
  {
    var matches = req.params.printId.match(/^([A-Z0-9]{32})\.(html|pdf)$/);

    if (matches === null)
    {
      return next(createHttpError('INVALID_PRINT_ID'));
    }

    var printId = matches[1];

    if (matches[2] === 'pdf')
    {
      res.sendfile(path.join(poModule.config.pdfStoragePath, printId + '.pdf'));
    }
    else
    {
      res.render('purchaseOrders/iframe', {
        orderId: req.params.orderId,
        printId: printId
      });
    }
  }

  function renderLabelPdfRoute(req, res, next)
  {
    var orderId = req.params.orderId;

    if (lockedOrders[orderId] === true)
    {
      return next(createHttpError('LOCKED'));
    }

    lockedOrders[orderId] = true;

    var shippingNo = lodash.isString(req.body.shippingNo)
      ? req.body.shippingNo.substr(0, 30).replace(RE_INVALID_SHIPPING_NO, '')
      : '';
    var paper = req.body.paper;
    var barcode = req.body.barcode;
    var items = !Array.isArray(req.body.items) ? [] : req.body.items;
    var currentDate = new Date();
    var currentUserInfo = userModule.createUserInfo(req.session.user, req);

    step(
      function validateRequestStep()
      {
        if (!PurchaseOrder.PAPERS[paper])
        {
          return this.skip(createHttpError('INVALID_PAPER'));
        }

        if (!PurchaseOrder.BARCODES[barcode])
        {
          return this.skip(createHttpError('INVALID_BARCODE'));
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
          return this.skip(createHttpError('INVALID_ITEMS'));
        }
      },
      function findPoStep()
      {
        PurchaseOrder.findById(orderId).exec(this.next());
      },
      function buildQueryStep(err, po)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!po)
        {
          return this.skip(createHttpError('PO_NOT_FOUND', 404));
        }

        var itemsById = {};

        po.items.forEach(function(item)
        {
          itemsById[+item._id] = item;
        });

        for (var i = 0, l = items.length; i < l; ++i)
        {
          var item = items[i];

          item.model = itemsById[+item._id];

          if (!item.model)
          {
            return this.skip(createHttpError('PO_ITEM_NOT_FOUND', 400));
          }
        }

        var query = [
          'paper=' + paper,
          'barcode=' + barcode
        ];

        items.forEach(function(item)
        {
          if (item.packageQty && item.componentQty)
          {
            for (var i = 0; i < item.packageQty; ++i)
            {
              pushQuery(item, item.componentQty);
            }
          }

          if (item.remainingQty)
          {
            pushQuery(item, item.remainingQty);
          }
        });

        this.po = po;
        this.query = query.join('&');
        this.printId = createHash('md5').update(this.query).digest('hex').toUpperCase();

        items.forEach(function(item)
        {
          item.model.prints.push({
            _id: this.printId,
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
        }, this);

        function pushQuery(item, quantity)
        {
          query.push(
            'orderNo[]=' + po._id,
            'nc12[]=' + item.model.nc12,
            'quantity[]=' + quantity,
            'itemNo[]=' + item._id,
            'vendorNo[]=' + po.vendor,
            'shippingNo[]=' + encodeURIComponent(shippingNo)
          );
        }
      },
      function checkCacheStep()
      {
        this.outputFile = path.join(poModule.config.pdfStoragePath, this.printId + '.pdf');

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
          + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : httpServer.config.host)
          + ':' + httpServer.config.port
          + '/purchaseOrders;renderLabelHtml'
          + '?' + this.query;

        var paperOptions = PurchaseOrder.PAPERS[paper];

        var cmd = format(
          '"%s" -q --dpi 120 --disable-smart-shrinking --no-outline %s --page-width %smm --page-height %smm "%s" "%s"',
          poModule.config.wkhtmltopdfExe,
          paperOptions.wkhtmltopdf,
          paperOptions.width,
          paperOptions.height,
          url,
          this.outputFile
        );

        exec(cmd, this.next());
      },
      function sendResultsStep(err, stdout, stderr)
      {
        delete lockedOrders[orderId];

        if (err)
        {
          return next(err);
        }

        if (lodash.isString(stdout) && lodash.isString(stderr))
        {
          savePoPrintChanges(this.po, currentDate, currentUserInfo, this.printId, shippingNo, paper, barcode, items);

          this.po = null;
        }

        return res.json(this.printId);
      }
    );
  }

  function savePoPrintChanges(po, date, user, printId, shippingNo, paper, barcode, items)
  {
    po.changes.push({
      date: date,
      user: user,
      data: {
        prints: [
          null,
          {
            _id: printId,
            shippingNo: shippingNo,
            paper: paper,
            barcode: barcode,
            items: items.map(function(item)
            {
              return {
                _id: item._id,
                nc12: item.model.nc12,
                packageQty: item.packageQty,
                componentQty: item.componentQty,
                remainingQty: item.remainingQty
              };
            })
          }
        ]
      }
    });

    po.save(function(err)
    {
      if (err)
      {
        poModule.warn("Failed to save the PO [%s] print [%s] changes: %s", po._id, printId, err.stack);
      }
      else
      {
        app.broker.publish('purchaseOrders.printed.' + po._id, po.toJSON());
      }
    });
  }

  function renderLabelHtmlRoute(req, res, next)
  {
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

    var barcodeDataToSvg = {};
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

      barcodeDataToSvg[page.barcodeData] = null;

      return page;
    });
    var uniqueBarcodes = Object.keys(barcodeDataToSvg);

    step(
      function()
      {
        for (var i = 0, l = uniqueBarcodes.length; i < l; ++i)
        {
          generateBarcode(barcodeType, barcodeOptions.zint, uniqueBarcodes[i], this.group());
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

        return res.render('purchaseOrders/' + paper, {
          paper: paper,
          barcode: barcode,
          pages: pages
        });
      }
    );
  }

  function generateBarcode(barcodeType, barcodeOptions, barcodeData, done)
  {
    var cmd = format(
      '"%s" --barcode=%d %s --notext --directsvg --data="%s"',
      poModule.config.zintExe,
      barcodeType,
      barcodeOptions,
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

  function togglePrintCancelRoute(req, res, next)
  {
    PurchaseOrder.findById(req.params.orderId).exec(function(err, po)
    {
      if (err)
      {
        return next(err);
      }

      if (req.body.__v !== po.__v)
      {
        return next(createHttpError('VERSION_MISMATCH'));
      }

      var item = lodash.find(po.items, function(item) { return item._id === req.body.itemId; });

      if (!item)
      {
        return next(createHttpError('ITEM_NOT_FOUND'));
      }

      var printIndex = lodash.findIndex(item.prints, function(print) { return print._id === req.body.printId; });
      var print = item.prints[printIndex];

      if (!print)
      {
        return next(createHttpError('PRINT_NOT_FOUND'));
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
  }
};
