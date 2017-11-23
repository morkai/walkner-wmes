// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const createPuppeteerPool = require('puppeteer-pool');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  storagePath: './data/html2pdf',
  poolOptions: {}
};

exports.start = function startHtml2pdfModule(app, module)
{
  module.pool = createPuppeteerPool(Object.assign({}, module.config.poolOptions, {
    min: 2,
    max: 5,
    idleTimeoutMillis: 30000,
    maxUses: 50,
    puppeteerArgs: {}
  }));

  app.onModuleReady(
    [
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
