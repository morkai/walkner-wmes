// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const format = require('util').format;
const _ = require('lodash');
const step = require('h5.step');
const request = require('request');

module.exports = function setUpPing(app, watchdogModule)
{
  const config = watchdogModule.config.ping;

  let lastNotifyAt = 0;
  let notifyTimer = null;

  if (config.window > 0)
  {
    app.onModuleReady(watchdogModule.config.expressId, setUpReceiver);

    app.broker.subscribe('app.started', () => scheduleNotify(1)).setLimit(1);
  }

  if (config.interval > 0)
  {
    app.broker.subscribe('app.started', ping).setLimit(1);
  }

  function ping()
  {
    step(
      function sendPingRequestStep()
      {
        request(config.localUrl, this.next());
      },
      function handlePingResponseStep(err, res, body)
      {
        if (err)
        {
          watchdogModule.debug("[ping] Failed local request: %s", err.message);

          return this.skip();
        }

        if (res.statusCode === 200 && body === 'pong')
        {
          request(config.remoteUrl, {method: 'POST', json: {secretKey: config.secretKey}}, this.next());
        }
        else
        {
          watchdogModule.debug(
            "[ping] Invalid local response (%d): %s",
            res.statusCode,
            typeof body === 'string' ? body.substring(0, 100) : '-'
          );
        }
      },
      function(err, res)
      {
        if (err)
        {
          watchdogModule.warn("[ping] Failed remote request: %s", err.message);
        }
        else if (res && res.statusCode >= 300)
        {
          watchdogModule.warn("[ping] Invalid remote response status code: %d", res.statusCode);
        }

        setTimeout(ping, config.interval);
      }
    );
  }

  function setUpReceiver()
  {
    app[watchdogModule.config.expressId].post('/watchdog/ping', function(req, res, next)
    {
      if (req.body.secretKey !== config.secretKey)
      {
        return next(app.createError('INVALID_SECRET_KEY', 403));
      }

      scheduleNotify(1);

      res.end();
    });
  }

  function scheduleNotify(delayMultiplier)
  {
    clearTimeout(notifyTimer);
    notifyTimer = setTimeout(notify, config.window * delayMultiplier);
  }

  function notify()
  {
    watchdogModule.debug("[ping] Service unavailable: notifying!");

    const subject = format(
      "[%s:%s:ping] Service unavailable", app.options.id, watchdogModule.name
    );
    const window = Math.round(config.window / 1000);
    const text = [
      `No ping request received in ${window}s: the Internet or the local HTTP server is down!`,
      "",
      "This message was generated automatically.",
      "Sincerely, WMES Bot"
    ];

    mail(subject, text);

    const now = Date.now();

    if (now - lastNotifyAt > 30 * 60 * 1000)
    {
      lastNotifyAt = now;

      call(`Service unavailable - no ping in ${window} seconds!`);
    }

    scheduleNotify(10);
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
        watchdogModule.error("[ping] [mail] Failed to notify [%s]: %s", to, err.message);
      }
      else
      {
        watchdogModule.debug("[ping] [mail] Notified: %s", to);
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
        watchdogModule.error("[ping] [call] Failed to notify [%s]: %s", sayOptions.to, err.message);
      }
      else
      {
        watchdogModule.debug("[ping] [call] Notified: %s", sayOptions.to);
      }
    });
  }
};
