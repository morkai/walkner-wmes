// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const format = require('util').format;
const _ = require('lodash');
const STATES = require('mongoose').Connection.STATES;

module.exports = function setUpDbCheck(app, watchdogModule)
{
  const mongoose = app[watchdogModule.config.mongooseId];

  let disconnects = 0;
  let wasDisconnected = mongoose.connection.readyState !== STATES.connected;
  let lastDisconnectCallAt = 0;

  app.broker.subscribe('app.started', checkConnectionStatus).setLimit(1);

  mongoose.connection.on('connected', checkConnectionStatus);
  mongoose.connection.on('disconnected', checkConnectionStatus);

  function checkConnectionStatus()
  {
    if (mongoose.connection.readyState === STATES.connected)
    {
      if (wasDisconnected)
      {
        wasDisconnected = false;

        notifyReconnect();
      }

      return;
    }

    if (disconnects === 0 || !wasDisconnected)
    {
      disconnects += 1;
      wasDisconnected = true;

      notifyDisconnect();
    }
  }

  function notifyReconnect()
  {
    const subject = format(
      "[%s:%s:dbCheck] Reconnected", app.options.id, watchdogModule.name
    );
    const text = [
      "Connection to the database was reestablished successfully!",
      "",
      "This message was generated automatically.",
      "Sincerely, WMES Bot"
    ];

    mail(subject, text);
  }

  function notifyDisconnect()
  {
    const subject = format(
      "[%s:%s:dbCheck] Disconnected", app.options.id, watchdogModule.name
    );
    const text = [
      "Connection to the database was lost!",
      "",
      "This message was generated automatically.",
      "Sincerely, WMES Bot"
    ];

    mail(subject, text);

    sms(`[${app.options.id}:${watchdogModule.name}] db connection lost`);

    const now = Date.now();

    if (now - lastDisconnectCallAt > 30 * 60 * 1000)
    {
      lastDisconnectCallAt = now;

      call("Lost the database connection!");
    }
  }

  function mail(subject, text)
  {
    const mailSender = app[watchdogModule.config.mailSenderId];

    if (!mailSender)
    {
      return;
    }

    const to = _.uniq([].concat(
      watchdogModule.config.recipients,
      watchdogModule.config.appStartedRecipients
    ));

    if (!to.length)
    {
      return;
    }

    mailSender.send(to, subject, text.join('\r\n'), function(err)
    {
      if (err)
      {
        watchdogModule.error("[dbCheck] [mail] Failed to notify [%s]: %s", to, err.message);
      }
      else
      {
        watchdogModule.debug("[dbCheck] [mail] Notified: %s", to);
      }
    });
  }

  function sms(text)
  {
    const smsSender = app[watchdogModule.config.smsSenderId];

    if (!smsSender || !watchdogModule.config.appStartedCallRecipient)
    {
      return;
    }

    const to = watchdogModule.config.appStartedCallRecipient;

    smsSender.send(to, text, function(err)
    {
      if (err)
      {
        watchdogModule.error("[dbCheck] [sms] Failed to notify [%s]: %s", to, err.message);
      }
      else
      {
        watchdogModule.debug("[dbCheck] [sms] Notified: %s", to);
      }
    });
  }

  function call(text)
  {
    const twilio = app[watchdogModule.config.twilioId];

    if (!twilio || !watchdogModule.config.appStartedCallRecipient)
    {
      return;
    }

    const sayOptions = {
      to: watchdogModule.config.appStartedCallRecipient,
      message: text,
      voice: 'alice',
      language: 'en-US'
    };

    twilio.say(sayOptions, function(err)
    {
      if (err)
      {
        watchdogModule.error("[dbCheck] [call] Failed to notify [%s]: %s", sayOptions.to, err.message);
      }
      else
      {
        watchdogModule.debug("[dbCheck] [call] Notified: %s", sayOptions.to);
      }
    });
  }
};
