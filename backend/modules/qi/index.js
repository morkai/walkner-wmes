// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  reportsId: 'reports',
  attachmentsDest: null
};

exports.start = function startQiModule(app, qaModule)
{
  qaModule.DICTIONARIES = {
    kinds: 'QiKind',
    faults: 'QiFault',
    errorCategories: 'QiErrorCategory',
    actionStatuses: 'QiActionStatus'
  };

  app.onModuleReady(
    [
      qaModule.config.mongooseId,
      qaModule.config.expressId,
      qaModule.config.userId,
      qaModule.config.settingsId,
      qaModule.config.reportsId
    ],
    setUpRoutes.bind(null, app, qaModule)
  );
};
