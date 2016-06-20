// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpNoEventCheck = require('./noEventCheck');
var setUpAppStartedEventCheck = require('./appStartedEventCheck');
var setUpEmptyDirectoryCheck = require('./emptyDirectoryCheck');
var setUpDbCheck = require('./dbCheck');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  mailSenderId: 'mail/sender',
  smsSenderId: 'sms/sender',
  twilioId: 'twilio',
  recipients: [],
  appStartedRecipients: [],
  appStartedCallRecipient: null,
  noEventRecipients: [],
  events: [],
  emptyDirectories: []
};

exports.start = function startWatchdogModule(app, watchdogModule)
{
  app.onModuleReady(
    [
      watchdogModule.config.mongooseId,
      watchdogModule.config.mailSenderId
    ],
    setUpNoEventCheck.bind(null, app, watchdogModule)
  );

  app.onModuleReady(
    [
      watchdogModule.config.mongooseId,
      watchdogModule.config.mailSenderId
    ],
    setUpAppStartedEventCheck.bind(null, app, watchdogModule)
  );

  app.onModuleReady(
    [
      watchdogModule.config.mongooseId
    ],
    setUpDbCheck.bind(null, app, watchdogModule)
  );

  setUpEmptyDirectoryCheck(app, watchdogModule);
};
