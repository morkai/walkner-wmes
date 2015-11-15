// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var fs = require('fs');
var format = require('util').format;
var path = require('path');
var _ = require('lodash');

module.exports = function setUpEmptyDirectoryCheck(app, watchdogModule)
{
  var lastResultMap = {};

  app.broker.subscribe('app.started', createDirectoryWatchers).setLimit(1);

  function createDirectoryWatchers()
  {
    _.forEach(watchdogModule.config.emptyDirectories, function(config)
    {
      if (!config.id)
      {
        config.id = path.basename(config.path);
      }

      checkDirectory(config);
    });
  }

  function checkDirectory(config)
  {
    watchdogModule.debug("[emptyDirectory] [%s] Checking...", config.id);

    fs.readdir(config.path, function(err, files)
    {
      if (err)
      {
        watchdogModule.error("[emptyDirectory] [%s] Failed to read dir: %s", config.id, err.message);

        return scheduleNextCheck(config);
      }

      if (files.length === 0)
      {
        watchdogModule.debug("[emptyDirectory] [%s] Empty :)", config.id);

        return scheduleNextCheck(config);
      }

      var lastResult = lastResultMap[config.path];

      if (_.isEmpty(lastResult))
      {
        lastResultMap[config.path] = files[0];

        watchdogModule.debug("[emptyDirectory] [%s] Stored: %s", config.id, files[0]);

        return scheduleNextCheck(config);
      }

      lastResultMap[config.path] = '';

      if (_.includes(files, lastResult))
      {
        watchdogModule.debug("[emptyDirectory] [%s] Not empty :(", config.id);

        notify(config);

        return scheduleNextCheck(config, true);
      }

      watchdogModule.debug("[emptyDirectory] [%s] Changing :)", config.id);

      return scheduleNextCheck(config);
    });
  }

  function scheduleNextCheck(config, notified)
  {
    setTimeout(checkDirectory, notified ? config.notifiedDelay : config.checkInterval, config);
  }

  function notify(config)
  {
    var to = _.unique([].concat(
      watchdogModule.config.recipients,
      config.emailRecipients || []
    ));

    if (to.length === 0 && _.isEmpty(config.callRecipient))
    {
      return watchdogModule.warn("[emptyDirectory] [%s] Nobody to notify :(", config.id);
    }

    var subject = format("[%s:emptyDirectory] %s", app.options.id, config.id);
    var text = [
      "Directory '" + config.id + "' is not empty!",
      "",
      "This message was generated automatically.",
      "Sincerely, WMES Bot"
    ].join('\r\n');

    var mailSender = app[watchdogModule.config.mailSenderId];

    if (mailSender && to.length)
    {
      mailSender.send(to, subject, text, function(err)
      {
        if (err)
        {
          watchdogModule.error("[emptyDirectory] [%s] Failed to notify [%s]: %s", config.id, to, err.message);
        }
        else
        {
          watchdogModule.debug("[emptyDirectory] [%s] Notified [%s].", to, config.id);
        }
      });
    }

    var twilio = app[watchdogModule.config.twilioId];

    if (twilio && config.callRecipient)
    {
      var sayOptions = {
        to: config.callRecipient,
        message: text,
        voice: 'alice',
        language: 'en-US'
      };

      twilio.say(sayOptions, function(err)
      {
        if (err)
        {
          watchdogModule.error(
            "[emptyDirectory] [%s] Failed to notify [%s]: %s", config.id, sayOptions.to, err.message
          );
        }
        else
        {
          watchdogModule.debug("[emptyDirectory] [%s] Notified [%s].", config.id, sayOptions.to);
        }
      });
    }
  }
};
