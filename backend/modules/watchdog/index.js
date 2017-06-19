// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpNoEventCheck = require('./noEventCheck');
const setUpAppStartedEventCheck = require('./appStartedEventCheck');
const setUpEmptyDirectoryCheck = require('./emptyDirectoryCheck');
const setUpDbCheck = require('./dbCheck');
const setUpPing = require('./ping');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  mailSenderId: 'mail/sender',
  smsSenderId: 'sms/sender',
  twilioId: 'twilio',
  expressId: 'express',
  recipients: [],
  appStartedRecipients: [],
  appStartedCallRecipient: null,
  noEventRecipients: [],
  events: [],
  emptyDirectories: [],
  ping: {
    secretKey: '?',
    remoteUrl: 'http://127.0.0.1/watchdog/ping',
    localUrl: 'http://127.0.0.1/ping',
    interval: 0,
    window: 0
  }
};

exports.start = function startWatchdogModule(app, watchdogModule)
{
  if (!watchdogModule.config.ping.window)
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
  }

  setUpPing(app, watchdogModule);
};
