// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpCommands = require('./commands');
const setUpNotifier = require('./notifier');
const setUpReminder = require('./reminder');
const setUpDurationRecalculator = require('./durationRecalculator');
const setUpStats = require('./stats');
const setUpObserverCleaner = require('./observerCleaner');

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

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpStats.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpObserverCleaner.bind(null, app, module)
  );
};
