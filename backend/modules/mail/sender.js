// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

exports.DEFAULT_CONFIG = {
  smtp: null,
  from: 'someone@the.net',
  bcc: '',
  replyTo: 'someone@the.net',
  expressId: 'express',
  secretKey: null,
  remoteSenderUrl: null
};

exports.start = function startMailSenderModule(app, module)
{
  var nodemailer;
  var request;

  if (module.config.smtp && module.config.remoteSenderUrl)
  {
    throw new Error("`smtp` and `remoteSenderUrl` cannot be used at the same time!");
  }
  else if (!module.config.smtp && !module.config.remoteSenderUrl)
  {
    throw new Error("`smtp` or `remoteSenderUrl` must be set!");
  }
  else if (module.config.smtp)
  {
    nodemailer = require('nodemailer');
  }
  else if (module.config.remoteSenderUrl)
  {
    request = require('request');
  }

  var transport = module.config.smtp ? nodemailer.createTransport(module.config.smtp) : null;

  /**
   * @param {string|Array.<string>} to
   * @param {string} subject
   * @param {string} text
   * @param {function(Error|null, object)} done
   */
  module.send = function(to, subject, text, done)
  {
    if (transport === null)
    {
      sendThroughRemote(to, subject, text, done);
    }
    else
    {
      sendThroughSmtp(to, subject, text, done);
    }
  };

  function sendThroughRemote(to, subject, text, done)
  {
    var options = {
      url: module.config.remoteSenderUrl,
      method: 'POST',
      json: true,
      body: {
        to: to,
        subject: subject,
        text: text,
        secretKey: module.config.secretKey
      }
    };

    request(options, function(err, res)
    {
      if (err)
      {
        return done(err);
      }

      if (res.statusCode !== 204)
      {
        return done(new Error('INVALID_REMOTE_RESPONSE'));
      }

      return done();
    });
  }

  function sendThroughSmtp(to, subject, text, done)
  {
    var mailOptions = {
      from: String(module.config.from),
      to: Array.isArray(to) ? to.join(', ') : to,
      bcc: String(module.config.bcc),
      replyTo: String(module.config.replyTo),
      subject: subject,
      text: String(text)
    };

    transport.sendMail(mailOptions, done);
  }

  app.onModuleReady(module.config.expressId, function()
  {
    var express = app[module.config.expressId];

    express.options('/mail;send', function(req, res)
    {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.end();
    });

    express.post('/mail;send', function(req, res, next)
    {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Content-Type');

      if (module.config.secretKey !== null && req.body.secretKey !== module.config.secretKey)
      {
        return next(express.createHttpError('INVALID_SECRET_KEY', 401));
      }

      module.send(req.body.to, req.body.subject, req.body.text, function(err)
      {
        if (err)
        {
          module.error("Failed to send e-mail [%s] to [%s]: %s", req.body.subject, req.body.to, err.message);

          return next(err);
        }

        module.debug("Sent e-mail to [%s]: %s", req.body.to, req.body.subject);

        res.send(204);
      });
    });
  });
};
