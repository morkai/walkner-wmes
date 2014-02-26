'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio'
};

exports.start = function startDiagModule(app, module)
{
  app.onModuleReady(
    [
      module.config.userId,
      module.config.expressId,
      module.config.mongooseId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.userId,
      module.config.sioId,
      module.config.mongooseId
    ],
    setUpCommands.bind(null, app, module)
  );
};
