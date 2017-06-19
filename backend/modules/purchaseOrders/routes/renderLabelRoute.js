// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const format = require('util').format;
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const step = require('h5.step');
const renderLabelHtmlRoute = require('./renderLabelHtmlRoute');

module.exports = function renderLabelRoute(app, poModule, req, res, next)
{
  const printId = req.params.printId;
  const outputFormat = req.params.format;

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

  const httpServer = app[poModule.config.httpServerId];
  const express = app[poModule.config.expressId];
  const mongoose = app[poModule.config.mongooseId];
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const PurchaseOrderPrint = mongoose.model('PurchaseOrderPrint');

  const pdfPath = path.join(poModule.config.pdfStoragePath, printId + '.pdf');

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

      const conditions = {};

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

      const url = 'http://'
        + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : httpServer.config.host)
        + ':' + httpServer.config.port
        + '/purchaseOrders;renderLabelHtml'
        + '?' + (printId.length === 32 ? 'key' : 'id') + '=' + printId;

      const paperOptions = PurchaseOrder.PAPERS[poPrint.paper];

      const cmd = format(
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
