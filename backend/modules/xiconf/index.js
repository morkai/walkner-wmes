// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpResultsImporter = require('./importer/results');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  sioId: 'sio',
  expressId: 'express',
  directoryWatcherId: 'directoryWatcher',
  productionId: 'production',
  userId: 'user',
  licensesId: 'licenses',
  featureDbPath: './',
  zipStoragePath: './',
  ordersImportPath: './',
  ordersImportFile: '{timestamp}@T_COOIS_XICONF_{step}.txt'
};

exports.start = function startXiconfModule(app, module)
{
  var config = module.config;

  module.programSyncQueue = [];

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
    setUpResultsImporter.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.sioId,
      config.productionId
    ],
    setUpCommands.bind(null, app, module)
  );
};
