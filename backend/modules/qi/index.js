// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpCounter = require('./counter');
const setUpNotifier = require('./notifier');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  httpServerId: 'httpServer',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  reportsId: 'reports',
  orgUnitsId: 'orgUnits',
  mailSenderId: 'mail/sender',
  wkhtmltopdfExe: 'wkhtmltopdf',
  attachmentsDest: null,
  emailUrlPrefix: 'http://127.0.0.1/'
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
      qiModule.config.reportsId,
      qiModule.config.orgUnitsId
    ],
    setUpRoutes.bind(null, app, qiModule)
  );

  app.onModuleReady(
    [
      qiModule.config.mongooseId
    ],
    setUpCounter.bind(null, app, qiModule)
  );

  app.onModuleReady(
    [
      qiModule.config.mongooseId,
      qiModule.config.orgUnitsId,
      qiModule.config.mailSenderId
    ],
    setUpNotifier.bind(null, app, qiModule)
  );
};
