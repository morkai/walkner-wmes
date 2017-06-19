// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpOrdersRoutes = require('./ordersRoutes');
const setUpMechOrdersRoutes = require('./mechOrdersRoutes');
const setUpEmptyOrdersRoutes = require('./emptyOrdersRoutes');
const setUpInvalidOrdersRoutes = require('./invalidOrdersRoutes');
const setUpOperationGroups = require('./operationGroups');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  iptCheckerClientId: 'messenger/client',
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
      setUpInvalidOrdersRoutes(app, module);
    }
  );

  app.onModuleReady(
    module.config.settingsId,
    setUpOperationGroups.bind(null, app, module)
  );
};
