// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var MailListener = require('mail-listener2');

exports.DEFAULT_CONFIG = {
  username: 'imap-username',
  password: 'imap-password',
  host: 'imap.host.com',
  port: 143,
  mailbox: 'INBOX',
  markSeen: true,
  fetchUnreadOnStart: true,
  mailParserOptions: {streamAttachments: true},
  restartMinutes: []
};

exports.start = function startMailListenerModule(app, module)
{
  var isConnected = false;
  var mailListener = null;
  var disconnectedAt = -1;

  app.broker
    .subscribe('app.started', setUpMailListener)
    .setLimit(1);

  if (module.config.restartMinutes.length)
  {
    setTimeout(checkRestart, 30 * 60 * 1000);
  }

  function setUpMailListener()
  {
    mailListener = new MailListener(module.config);

    mailListener.on('server:connected', function()
    {
      isConnected = true;

      module.debug("Connected to the IMAP server");
    });

    mailListener.on('server:disconnected', function()
    {
      if (isConnected)
      {
        isConnected = false;
        disconnectedAt = Date.now();

        module.warn("Disconnected from the IMAP server");
      }

      mailListener.removeAllListeners();
      mailListener.stop();

      process.nextTick(setUpMailListener);
    });

    mailListener.on('error', function(err)
    {
      if (err.syscall === 'connect' && !isConnected)
      {
        return;
      }

      module.error(err.message);
    });

    mailListener.on('mail', function(mail)
    {
      app.broker.publish('mail.received', mail);
    });

    mailListener.on('attachment', function(attachment)
    {
      app.broker.publish('mail.attachment', attachment);
    });

    mailListener.start();
  }

  function checkRestart()
  {
    var nextCheckDelay = 20 * 1000;
    var now = new Date();

    if (mailListener && module.config.restartMinutes.indexOf(now.getMinutes()) !== -1)
    {
      module.debug("Restarting...");

      mailListener.stop();

      now = now.getTime();

      var then = new Date(now + 60000);
      then.setSeconds(1);
      then.setMilliseconds(0);

      nextCheckDelay = Math.max(nextCheckDelay, then.getTime() - now);

      setTimeout(checkDisconnect, 5000);
    }

    setTimeout(checkRestart, nextCheckDelay);
  }

  function checkDisconnect()
  {
    if (Date.now() - disconnectedAt < 10000)
    {
      return;
    }

    module.debug("Destroying...");

    mailListener.removeAllListeners();
    mailListener.imap.destroy();

    isConnected = false;
    mailListener = null;
    disconnectedAt = Date.now();

    setImmediate(setUpMailListener);
  }
};
