// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpOrdersRoutes = require('./ordersRoutes');
var setUpMechOrdersRoutes = require('./mechOrdersRoutes');
var setUpEmptyOrdersRoutes = require('./emptyOrdersRoutes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  importPath: './',
  zintExe: 'zint'
};

exports.start = function startOrdersModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
    ],
    function()
    {
      setUpOrdersRoutes(app, module);
      setUpMechOrdersRoutes(app, module);
      setUpEmptyOrdersRoutes(app, module);
    }
  );
};
