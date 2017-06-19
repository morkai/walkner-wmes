// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  userId: 'user',
  mongooseId: 'mongoose',
  importPath: './',
  ccImportFile: '{timestamp}@T_LS41_{step}.txt',
  toImportFile: '{timestamp}@T_LT23_{step}.txt'
};

exports.start = function startWarehouseModule(app, whModule)
{
  app.onModuleReady(
    [
      whModule.config.expressId,
      whModule.config.userId,
      whModule.config.mongooseId
    ],
    setUpRoutes.bind(null, app, whModule)
  );
};
