'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  userId: 'user',
  expressId: 'express',
  sioId: 'sio'
};

exports.start = function startPressWorksheetsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.sioId
    ],
    setUpCommands.bind(null, app, module)
  );
};
