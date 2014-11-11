// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var format = require('util').format;
var exec = require('child_process').exec;
var createHash = require('crypto').createHash;
var path = require('path');
var fs = require('fs');
var lodash = require('lodash');
var step = require('h5.step');

module.exports = function renderLabelPdfRoute(app, poModule, req, res, next)
{
  var httpServer = app[poModule.config.httpServerId];
  var express = app[poModule.config.expressId];
  var userModule = app[poModule.config.userId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');

  var orderId = req.params.orderId;

  if (poModule.lockedOrders[orderId] === true)
  {
    return next(express.createHttpError('LOCKED'));
  }

  poModule.lockedOrders[orderId] = true;

  var shippingNo = lodash.isString(req.body.shippingNo)
    ? req.body.shippingNo.substr(0, 30).replace(/[^a-zA-Z0-9\/\\.\-: ]+$/g, '')
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
        return this.skip(express.createHttpError('INVALID_PAPER'));
      }

      if (!PurchaseOrder.BARCODES[barcode])
      {
        return this.skip(express.createHttpError('INVALID_BARCODE'));
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
        return this.skip(express.createHttpError('INVALID_ITEMS'));
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
        return this.skip(express.createHttpError('PO_NOT_FOUND', 404));
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
          return this.skip(express.createHttpError('PO_ITEM_NOT_FOUND', 400));
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
      var args = format(
        '-q --dpi 120 --disable-smart-shrinking --no-outline %s --page-width %smm --page-height %smm "%s" "%s"',
        paperOptions.wkhtmltopdf,
        paperOptions.width,
        paperOptions.height,
        url,
        this.outputFile.replace(/\\/g, '/')
      );
      var renderCmdFile = path.join(poModule.config.renderCmdPath, Date.now() + Math.random() + '.txt');
      var next = this.next();

      fs.writeFile(renderCmdFile, args, function(err)
      {
        if (err)
        {
          return next(err);
        }

        var cmd = format('"%s" --read-args-from-stdin < "%s"', poModule.config.wkhtmltopdfExe, renderCmdFile);

        exec(cmd, function(err, stdout, stderr)
        {
          fs.unlink(renderCmdFile, function(err)
          {
            if (err)
            {
              poModule.warn("Failed to remove the render command file [%s]: %s", renderCmdFile, err.message);
            }
          });

          next(err, stdout, stderr);
        });
      });
    },
    function sendResultsStep(err, stdout, stderr)
    {
      delete poModule.lockedOrders[orderId];

      if (err)
      {
        return next(err);
      }

      if (lodash.isString(stdout) && lodash.isString(stderr))
      {
        savePoPrintChanges(app, poModule, {
          po: this.po,
          date: currentDate,
          user: currentUserInfo,
          printId: this.printId,
          shippingNo: shippingNo,
          paper: paper,
          barcode: barcode,
          items: items
        });

        this.po = null;
      }

      return res.json(this.printId);
    }
  );
};

function savePoPrintChanges(app, poModule, options)
{
  options.po.changes.push({
    date: options.date,
    user: options.user,
    data: {
      prints: [
        null,
        {
          _id: options.printId,
          shippingNo: options.shippingNo,
          paper: options.paper,
          barcode: options.barcode,
          items: options.items.map(function(item)
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

  options.po.save(function(err)
  {
    if (err)
    {
      poModule.warn("Failed to save the PO [%s] print [%s] changes: %s", options.po._id, options.printId, err.stack);
    }
    else
    {
      app.broker.publish('purchaseOrders.printed.' + options.po._id, options.po.toJSON());
    }
  });
}
