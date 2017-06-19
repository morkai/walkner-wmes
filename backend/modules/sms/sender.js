// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const step = require('h5.step');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  secretKey: null,
  smsPath: null
};

exports.start = function startSmsSenderModule(app, module)
{
  let request;

  if (module.config.remoteSenderUrl)
  {
    request = require('request');
  }

  /**
   * @param {string|Array.<string>} to
   * @param {string} text
   * @param {function(Error|null, object)} done
   */
  module.send = function(to, text, done)
  {
    let smsOptions;

    if (arguments.length > 2)
    {
      smsOptions = {
        to: to,
        text: text
      };
    }
    else
    {
      smsOptions = to;
      done = text;
    }

    if (typeof smsOptions.to === 'string')
    {
      smsOptions.to = [smsOptions.to];
    }

    if (!Array.isArray(smsOptions.to) || !smsOptions.to.length)
    {
      return setImmediate(done, new Error('No recipients.'));
    }

    if (request)
    {
      sendThroughRemote(smsOptions, done);
    }
    if (!_.isEmpty(module.config.smsPath))
    {
      sendThroughFile(smsOptions, done);
    }
    else
    {
      module.debug('Not sending SMS: %s', JSON.stringify(smsOptions));

      setImmediate(done);
    }
  };

  function sendThroughRemote(body, done)
  {
    const options = {
      url: module.config.remoteSenderUrl,
      method: 'POST',
      json: true,
      body: _.assign(body, {secretKey: module.config.secretKey})
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

  function sendThroughFile(smsOptions, done)
  {
    step(
      function openFileStep()
      {
        const smsFileName = 'WMES_'
          + Math.round(Date.now() + Math.random() * 99999999).toString(36).toUpperCase()
          + '.sms';

        fs.open(path.join(module.config.smsPath, smsFileName), 'wx+', this.next());
      },
      function writeFileStep(err, fd)
      {
        if (err)
        {
          return this.done(done, err);
        }

        this.fd = fd;

        const contents = smsOptions.to.join('') + ',' + smsOptions.text;

        fs.write(fd, contents, 0, 'utf8', this.next());
      },
      function closeFileStep(err)
      {
        const fd = this.fd;
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
    const express = app[module.config.expressId];

    express.options('/sms;send', function(req, res)
    {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.end();
    });

    express.post('/sms;send', function(req, res, next)
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
          module.error('Failed to send SMS to [%s]: %s', req.body.to, err.message);

          return next(err);
        }

        module.debug('Sent SMS to: %s', req.body.to);

        res.sendStatus(204);
      });
    });
  });
};
