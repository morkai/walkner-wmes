// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpImporter = require('./importer');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  directoryWatcherId: 'directoryWatcher',
  userId: 'user',
  licensesId: 'licenses',
  fileStoragePath: './',
  zipStoragePath: './'
};

exports.start = function startIcpoModule(app, module)
{
  const config = module.config;

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.directoryWatcherId,
      config.licensesId
    ],
    setUpImporter.bind(null, app, module)
  );
};
