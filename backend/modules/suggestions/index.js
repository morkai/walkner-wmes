// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpNotifier = require('./notifier');
var setUpReminder = require('./reminder');
var setUpDurationRecalculator = require('./durationRecalculator');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  sioId: 'sio',
  userId: 'user',
  mailSenderId: 'mail/sender',
  reportsId: 'reports',
  kaizenId: 'kaizen',
  attachmentsDest: null,
  emailUrlPrefix: 'http://127.0.0.1/',
  multiType: true,
  remind: 14
};

exports.start = function startSuggestionsModule(app, module)
{
  if (module.config.emailUrlPrefix.substr(-1) !== '/')
  {
    module.config.emailUrlPrefix += '/';
  }

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.expressId,
      module.config.userId,
      module.config.reportsId,
      module.config.kaizenId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.sioId,
      module.config.userId
    ],
    setUpCommands.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.mailSenderId
    ],
    setUpNotifier.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.mailSenderId
    ],
    setUpReminder.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpDurationRecalculator.bind(null, app, module)
  );
};
