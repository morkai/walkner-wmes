// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpNotifier = require('./notifier');
var setUpReminder = require('./reminder');
var setUpStats = require('./stats');
var setUpObserverCleaner = require('./observerCleaner');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user',
  mailSenderId: 'mail/sender',
  reportsId: 'reports',
  attachmentsDest: null,
  emailUrlPrefix: 'http://127.0.0.1/',
  multiType: true,
  remind: 14
};

exports.start = function startKaizenModule(app, kaizenModule)
{
  if (kaizenModule.config.emailUrlPrefix.substr(-1) !== '/')
  {
    kaizenModule.config.emailUrlPrefix += '/';
  }

  kaizenModule.DICTIONARIES = {
    sections: 'KaizenSection',
    areas: 'KaizenArea',
    categories: 'KaizenCategory',
    causes: 'KaizenCause',
    risks: 'KaizenRisk',
    productFamilies: 'KaizenProductFamily'
  };

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId,
      kaizenModule.config.expressId,
      kaizenModule.config.userId,
      kaizenModule.config.reportsId
    ],
    setUpRoutes.bind(null, app, kaizenModule)
  );

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId,
      kaizenModule.config.sioId,
      kaizenModule.config.userId
    ],
    setUpCommands.bind(null, app, kaizenModule)
  );

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId,
      kaizenModule.config.mailSenderId
    ],
    setUpNotifier.bind(null, app, kaizenModule)
  );

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId,
      kaizenModule.config.mailSenderId
    ],
    setUpReminder.bind(null, app, kaizenModule)
  );

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId
    ],
    setUpStats.bind(null, app, kaizenModule)
  );

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId
    ],
    setUpObserverCleaner.bind(null, app, kaizenModule)
  );
};
