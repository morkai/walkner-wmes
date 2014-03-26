'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  orgUnitsId: 'orgUnits',
  javaBatik: null
};

exports.start = function startReportsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.orgUnitsId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
