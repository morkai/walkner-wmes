// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');
var setUpCounter = require('./counter');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  reportsId: 'reports',
  attachmentsDest: null
};

exports.start = function startQiModule(app, qiModule)
{
  qiModule.DICTIONARIES = {
    kinds: 'QiKind',
    faults: 'QiFault',
    errorCategories: 'QiErrorCategory',
    actionStatuses: 'QiActionStatus'
  };

  qiModule.tmpAttachments = {};

  app.onModuleReady(
    [
      qiModule.config.mongooseId,
      qiModule.config.expressId,
      qiModule.config.userId,
      qiModule.config.settingsId,
      qiModule.config.reportsId
    ],
    setUpRoutes.bind(null, app, qiModule)
  );

  app.onModuleReady(
    [
      qiModule.config.mongooseId
    ],
    setUpCounter.bind(null, app, qiModule)
  );
};
