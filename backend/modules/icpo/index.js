// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');
var setUpImporter = require('./importer');

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
  var config = module.config;

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
