// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var format = require('util').format;
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var step = require('h5.step');
var renderLabelHtmlRoute = require('./renderLabelHtmlRoute');

module.exports = function renderLabelRoute(app, poModule, req, res, next)
{
  var printId = req.params.printId;
  var outputFormat = req.params.format;

  if (outputFormat === 'pdf+html')
  {
    return res.render('purchaseOrders/iframe', {
      mainCssFile: app.options.mainCssFile || '/assets/main.css',
      orderId: req.params.orderId,
      printId: printId
    });
  }

  if (outputFormat === 'html')
  {
    req.query[printId.length === 32 ? 'key' : 'id'] = printId;

    return renderLabelHtmlRoute(app, poModule, req, res, next);
  }

  var httpServer = app[poModule.config.httpServerId];
  var express = app[poModule.config.expressId];
  var mongoose = app[poModule.config.mongooseId];
  var PurchaseOrder = mongoose.model('PurchaseOrder');
  var PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  var pdfPath = path.join(poModule.config.pdfStoragePath, printId + '.pdf');

  step(
    function checkStorageStep()
    {
      fs.pathExists(pdfPath, this.next());
    },
    function findPoPrintStep(err, exists)
    {
      if (exists)
      {
        return this.skip();
      }

      var conditions = {};

      conditions[printId.length === 32 ? 'key' : '_id'] = printId;

      PurchaseOrderPrint.findOne(conditions, {paper: 1}).lean().exec(this.next());
    },
    function renderLabelPdfStep(err, poPrint)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!poPrint)
      {
        return this.skip(express.createHttpError('PO_PRINT_NOT_FOUND', 404));
      }

      var url = 'http://'
        + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : httpServer.config.host)
        + ':' + httpServer.config.port
        + '/purchaseOrders;renderLabelHtml'
        + '?' + (printId.length === 32 ? 'key' : 'id') + '=' + printId;

      var paperOptions = PurchaseOrder.PAPERS[poPrint.paper];

      var cmd = format(
        '"%s" -q --dpi 120 --disable-smart-shrinking --no-outline %s --page-width %smm --page-height %smm "%s" "%s"',
        poModule.config.wkhtmltopdfExe,
        paperOptions.wkhtmltopdf,
        paperOptions.width,
        paperOptions.height,
        url,
        pdfPath
      );

      exec(cmd, this.next());
    },
    function sendPdfStep(err)
    {
      if (err)
      {
        return next(err);
      }

      res.sendFile(pdfPath);
    }
  );
};
