// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpNotifier = require('./notifier');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user',
  mailSenderId: 'mail/sender',
  attachmentsDest: null,
  emailUrlPrefix: 'http://127.0.0.1/',
  multiType: true
};

exports.start = function startKaizenModule(app, kaizenModule)
{
  kaizenModule.DICTIONARIES = {
    sections: 'KaizenSection',
    areas: 'KaizenArea',
    categories: 'KaizenCategory',
    causes: 'KaizenCause',
    risks: 'KaizenRisk'
  };

  app.onModuleReady(
    [
      kaizenModule.config.mongooseId,
      kaizenModule.config.expressId,
      kaizenModule.config.userId
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
};
