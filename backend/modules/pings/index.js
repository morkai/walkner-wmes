// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const url = require('url');
const _ = require('lodash');
const resolveIpAddress = require('../util/resolveIpAddress');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startPingsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.expressId,
      module.config.mongooseId,
      module.config.userId
    ],
    setUpRoutes.bind(null, app, module)
  );

  module.recordHttpRequest = recordHttpRequest;

  app.broker.subscribe('ping', recordPing);

  app.broker
    .subscribe('express.beforeRouter')
    .setLimit(1)
    .on('message', function(message)
    {
      const expressModule = message.module;
      const expressApp = expressModule.app;

      expressApp.use(expressMiddleware);
    });

  function recordHttpRequest(req)
  {
    if (!req.socket || !req.headers || !req.url)
    {
      return;
    }

    if (!req.query)
    {
      req.query = url.parse(req.url, true).query;
    }

    recordPing({
      _id: resolveIpAddress(req),
      host: req.query.COMPUTERNAME,
      headers: req.headers,
      url: req.url,
      user: req.session && req.session.user ? req.session.user.login : undefined
    });
  }

  function recordPing(data)
  {
    var mongoose = app[module.config.mongooseId];

    if (!mongoose)
    {
      return;
    }

    const conditions = {
      _id: data._id
    };
    const update = {
      time: new Date()
    };

    ['host', 'user', 'headers', 'url'].forEach(function(p)
    {
      if (!_.isEmpty(data[p]))
      {
        update[p] = data[p];
      }
    });

    mongoose.model('Ping').update(conditions, update, {upsert: true}, function(err)
    {
      if (err)
      {
        module.error(`Failed to record ping: ${err.message}\n${JSON.stringify(Object.assign(update, conditions))}`);
      }
    });
  }

  function expressMiddleware(req, res, next)
  {
    if (!req.isFrontendRequest)
    {
      module.recordHttpRequest(req);
    }

    next();
  }
};
