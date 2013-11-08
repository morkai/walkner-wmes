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
  mailParserOptions: {streamAttachments: true}
};

exports.start = function startMailListenerModule(app, module)
{
  app.broker
    .subscribe('app.started', setUpMailListener)
    .setLimit(1);

  function setUpMailListener()
  {
    var mailListener = new MailListener(module.config);

    mailListener.on('server:connected', function()
    {
      module.debug("Connected to the IMAP server");
    });

    mailListener.on('server:disconnected', function()
    {
      module.warn("Disconnected from the IMAP server");

      mailListener.removeAllListeners();
      mailListener.stop();

      process.nextTick(setUpMailListener);
    });

    mailListener.on('error', function(err)
    {
      module.error(err.message);
    });

    mailListener.on('mail', function(mail)
    {
      app.broker.publish('mailListener.received', mail);
    });

    mailListener.start();
  }
};
