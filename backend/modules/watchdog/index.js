// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var format = require('util').format;
var _ = require('lodash');
var later = require('later');
var moment = require('moment');

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

  app.broker.subscribe('app.started').setLimit(1).on('message', function()
  {
    mailSender = app[watchdogModule.config.mailSenderId];
    twilio = app[watchdogModule.config.twilioId];
    Event = app[watchdogModule.config.mongooseId].model('Event');

    _.forEach(watchdogModule.config.events, function(event)
    {
      _.defaults(event, {
        checkDelay: 30,
        checkWindow: Math.round((event.checkDelay || 30) * 1.5)
      });

      watchdogModule.debug(
        "[%s] Setting up... next occurrence at %s!",
        event.id,
        app.formatDateTime(later.schedule(event.schedule).next(1))
      );

      later.setInterval(scheduleEventCheck.bind(null, event), event.schedule);
    });

    checkAppStartedEvents();
  });

  function scheduleEventCheck(event)
  {
    watchdogModule.debug("[%s] Scheduling next check to be in %d minutes...", event.id, event.checkDelay);

    setTimeout(checkEvent, event.checkDelay * 60 * 1000, event);
  }

  function checkEvent(event)
  {
    watchdogModule.debug("[%s] Checking...", event.id);

    var conditions = _.merge({type: event.type}, event.conditions);

    Event.find(conditions, {time: 1}).sort({time: -1}).limit(1).exec(function(err, docs)
    {
      if (err)
      {
        return watchdogModule.error("[%s] Failed to find events: %s", event.id, err.message);
      }

      var lastOccurrenceAt = docs.length ? docs[0].time : 0;
      var requiredOccurrenceAt = moment().subtract(event.checkWindow, 'minutes').valueOf();

      if (lastOccurrenceAt >= requiredOccurrenceAt)
      {
        return watchdogModule.info("[%s] Event occurred! We're fine, everything is fine :)", event.id);
      }

      watchdogModule.warn("[%s] Event not occurred :( Notifying concerned parties!", event.id);

      notifyNoEvent(event, lastOccurrenceAt);
    });
  }

  function notifyNoEvent(event, lastOccurrenceAt)
  {
    var to = _.unique([].concat(
      event.recipients || [],
      watchdogModule.config.recipients,
      watchdogModule.config.noEventRecipients
    ));

    if (to.length === 0)
    {
      return watchdogModule.warn("[%s] Nobody to notify :(", event.id);
    }

    var subject = format("[%s:%s:noEvent] %s", app.options.id, watchdogModule.name, event.id);
    var text = [
      format(
        "Expected an event of type '%s' in the last %d minutes, but no event occurred :(",
        event.type,
        event.checkWindow
      ),
      format("The last occurrence was at %s.", app.formatDateTime(lastOccurrenceAt)),
      "",
      "This message was generated automatically.",
      "Sincerely, WMES Bot"
    ];

    mailSender.send(to, subject, text.join('\r\n'), function(err)
    {
      if (err)
      {
        watchdogModule.error("[%s] Failed to notify [%s]: %s", event.id, to, err.message);
      }
      else
      {
        watchdogModule.debug("[%s] Notified: %s", event.id, to);
      }
    });
  }

  function checkAppStartedEvents()
  {
    var now = Date.now();

    Event.find({type: 'app.started', time: {$gte: lastAppStartedCheckAt}}).lean().exec(function(err, events)
    {
      if (err)
      {
        watchdogModule.error("Failed to find app.started events: %s", err.message);

        return setTimeout(checkAppStartedEvents, 60 * 1000);
      }

      lastAppStartedCheckAt = now;

      if (!events.length)
      {
        return setTimeout(checkAppStartedEvents, 60 * 1000);
      }

      notifyAppStartedEvent(events);

      setTimeout(checkAppStartedEvents, 15 * 60 * 1000);
    });
  }

  function notifyAppStartedEvent(events)
  {
    var to = _.unique([].concat(
      watchdogModule.config.recipients,
      watchdogModule.config.appStartedRecipients
    ));

    if (to.length === 0 && _.isEmpty(watchdogModule.config.appStartedCallRecipient))
    {
      return watchdogModule.warn("[app.started] Nobody to notify :(");
    }

    var restarts = {};

    _.forEach(events, function(event)
    {
      var appId = event.data.id;

      if (!restarts[appId])
      {
        restarts[appId] = {
          count: 0,
          time: event.time
        };
      }

      ++restarts[appId].count;
    });

    var subject = format(
      "[%s:%s:appStarted] %s", app.options.id, watchdogModule.name, Object.keys(restarts).join(', ')
    );
    var text = [
      "Detected server restarts:"
    ];

    _.forEach(restarts, function(appRestart, appId)
    {
      text.push(format(
        "  - %dx %s @ %s",
        appRestart.count,
        appId,
        app.formatDateTime(appRestart.time)
      ));
    });

    text.push(
      "",
      "This message was generated automatically.",
      "Sincerely, WMES Bot"
    );

    text = text.join('\r\n');

    if (to.length)
    {
      mailSender.send(to, subject, text, function(err)
      {
        if (err)
        {
          watchdogModule.error("[app.started] Failed to notify [%s]: %s", to, err.message);
        }
        else
        {
          watchdogModule.debug("[app.started] Notified: %s", to);
        }
      });
    }

    if (watchdogModule.config.appStartedCallRecipient)
    {
      var sayOptions = {
        to: watchdogModule.config.appStartedCallRecipient,
        message: text,
        voice: 'alice',
        language: 'en-US'
      };

      twilio.say(sayOptions, function(err)
      {
        if (err)
        {
          watchdogModule.error("[app.started] Failed to notify [%s]: %s", sayOptions.to, err.message);
        }
        else
        {
          watchdogModule.debug("[app.started] Notified: %s", sayOptions.to);
        }
      });
    }
  }
};
