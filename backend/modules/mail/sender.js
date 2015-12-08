// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var step = require('h5.step');

exports.DEFAULT_CONFIG = {
  smtp: null,
  from: 'someone@the.net',
  bcc: '',
  replyTo: 'someone@the.net',
  expressId: 'express',
  secretKey: null,
  remoteSenderUrl: null,
  emailsPath: null
};

exports.start = function startMailSenderModule(app, module)
{
  var nodemailer;
  var request;

  if (module.config.smtp && module.config.remoteSenderUrl)
  {
    throw new Error("`smtp` and `remoteSenderUrl` cannot be used at the same time!");
  }
  else if (!module.config.smtp && !module.config.remoteSenderUrl && !module.config.emailsPath)
  {
    module.warn("No `smtp`, `remoteSenderUrl` or `emailsPath` specified.");
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
    var mailOptions;

    if (arguments.length > 2)
    {
      mailOptions = {
        to: to,
        subject: subject,
        text: text
      };
    }
    else
    {
      mailOptions = to;
      done = subject;
    }

    if (module.config.remoteSenderUrl !== null)
    {
      sendThroughRemote(mailOptions, done);
    }
    else if (transport !== null)
    {
      sendThroughSmtp(mailOptions, done);
    }
    else if (module.config.emailsPath !== null)
    {
      sendThroughFile(mailOptions, done);
    }
    else
    {
      module.debug("Not sending e-mail: %s", JSON.stringify(mailOptions));

      setImmediate(done);
    }
  };

  function sendThroughRemote(body, done)
  {
    var options = {
      url: module.config.remoteSenderUrl,
      method: 'POST',
      json: true,
      body: _.defaults(_.merge(body, {secretKey: module.config.secretKey}), {
        from: module.config.from || undefined,
        bcc: module.config.bcc || undefined,
        replyTo: module.config.replyTo || undefined
      })
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

  function sendThroughSmtp(mailOptions, done)
  {
    _.defaults(mailOptions, {
      from: String(module.config.from),
      bcc: String(module.config.bcc),
      replyTo: String(module.config.replyTo)
    });

    transport.sendMail(mailOptions, done);
  }

  function sendThroughFile(mailOptions, done)
  {
    _.defaults(mailOptions, {
      from: String(module.config.from),
      bcc: String(module.config.bcc),
      replyTo: String(module.config.replyTo)
    });

    var email = [];

    _.forEach(['subject', 'to', 'cc', 'bcc', 'from', 'replyTo'], function(header)
    {
      if (!_.isEmpty(mailOptions[header]))
      {
        email.push(header + ': ' + mailOptions[header]);
      }
    });

    var htmlBody = _.isString(mailOptions.html) && !_.isEmpty(mailOptions.html);

    if (htmlBody)
    {
      email.push('html: 1');
    }

    email.push('Body:', mailOptions[htmlBody ? 'html' : 'text'] || '');

    step(
      function openFileStep()
      {
        var emailFileName = (Date.now() + Math.random() * 99999999).toString(36).toUpperCase() + '.email';

        fs.open(path.join(module.config.emailsPath, emailFileName), 'wx+', this.next());
      },
      function writeFileStep(err, fd)
      {
        if (err)
        {
          return this.done(done, err);
        }

        this.fd = fd;

        fs.write(fd, email.join('\r\n'), 0, 'utf8', this.next());
      },
      function closeFileStep(err)
      {
        var fd = this.fd;
        this.fd = null;

        if (err)
        {
          fs.close(fd, function() {});

          return done(err);
        }

        fs.close(fd, done);
      }
    );
  }

  app.onModuleReady(module.config.expressId, function()
  {
    if (!transport)
    {
      return;
    }

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

      module.send(req.body, function(err)
      {
        if (err)
        {
          module.error("Failed to send e-mail [%s] to [%s]: %s", req.body.subject, req.body.to, err.message);

          return next(err);
        }

        module.debug("Sent e-mail to [%s]: %s", req.body.to, req.body.subject);

        res.sendStatus(204);
      });
    });
  });
};
