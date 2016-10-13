// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpOrdersRoutes = require('./ordersRoutes');
const setUpMechOrdersRoutes = require('./mechOrdersRoutes');
const setUpEmptyOrdersRoutes = require('./emptyOrdersRoutes');
const setUpOperationGroups = require('./operationGroups');

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

  app.onModuleReady(
    module.config.settingsId,
    setUpOperationGroups.bind(null, app, module)
  );
};
