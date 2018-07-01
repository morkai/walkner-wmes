// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const createPuppeteerPool = require('puppeteer-pool');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  mongooseId: 'mongoose',
  fileUrl: 'http://localhost/html2pdf/${hash}.${format}',
  storagePath: './data/html2pdf',
  poolOptions: {},
  sumatraExe: 'SumatraPDF.exe'
};

exports.start = function startHtml2pdfModule(app, module)
{
  module.pool = createPuppeteerPool(_.defaults({}, module.config.poolOptions, {
    min: 2,
    max: 5,
    idleTimeoutMillis: 30000,
    maxUses: 50,
    puppeteerArgs: {}
  }));

  app.onModuleReady(
    [
      module.config.expressId,
      module.config.mongooseId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
