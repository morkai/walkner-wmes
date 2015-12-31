// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  httpServerId: 'httpServer',
  userId: 'user',
  zintExe: 'zint',
  wkhtmltopdfExe: 'wkhtmltopdf',
  pdfStoragePath: './',
  renderCmdPath: './'
};

exports.start = function startPurchaseOrdersModule(app, poModule)
{
  poModule.lockedOrders = {};

  app.onModuleReady(
    [
      poModule.config.mongooseId,
      poModule.config.userId,
      poModule.config.expressId,
      poModule.config.httpServerId
    ],
    setUpRoutes.bind(null, app, poModule)
  );
};
