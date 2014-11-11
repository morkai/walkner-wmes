// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');

module.exports = function getLabelPdfRoute(app, poModule, req, res, next)
{
  var express = app[poModule.config.expressId];

  var matches = req.params.printId.match(/^([A-Z0-9]{32})\.(html|pdf)$/);

  if (matches === null)
  {
    return next(express.createHttpError('INVALID_PRINT_ID'));
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
};
