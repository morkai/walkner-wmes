// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpGenerator = require('./generator');
const setUpState = require('./state');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  updaterId: 'updater',
  html2pdfId: 'html2pdf',
  generator: false
};

exports.start = function startWhModule(app, module)
{
  const config = module.config;

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId,
      config.updaterId,
      config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  if (config.generator)
  {
    app.onModuleReady(
      [
        config.mongooseId,
        config.settingsId
      ],
      setUpGenerator.bind(null, app, module)
    );
  }
  else
  {
    app.onModuleReady(
      [
        config.mongooseId,
        config.userId,
        config.settingsId,
        config.html2pdfId
      ],
      setUpState.bind(null, app, module)
    );
  }
};
