// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var format = require('util').format;
var _ = require('lodash');
var later = require('later');
var moment = require('moment');
var setUpNoEventCheck = require('./noEventCheck');
var setUpAppStartedEventCheck = require('./appStartedEventCheck');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  mailSenderId: 'mail/sender',
  twilioId: 'twilio',
  recipients: [],
  appStartedRecipients: [],
  appStartedCallRecipient: null,
  noEventRecipients: [],
  events: []
};

exports.start = function startWatchdogModule(app, watchdogModule)
{
  var mailSender;
  var twilio;
  var Event;
  var lastAppStartedCheckAt = Date.now();

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
};
