// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpImporter = require('./importer');
const importQueueFile = require('./importQueueFile');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  fteId: 'fte',
  directoryWatcherId: 'directoryWatcher'
};

exports.start = function startPaintShopModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.fteId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.directoryWatcherId,
      module.config.mongooseId,
      module.config.fteId
    ],
    setUpImporter.bind(null, app, module)
  );

  module.importing = false;

  module.importQueueFile = importQueueFile.bind(null, app, module);
};
