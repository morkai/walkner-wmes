// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpPingsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Ping = mongoose.model('Ping');

  express.get('/ping', function(req, res)
  {
    res.type('text/plain');
    res.set('Access-Control-Allow-Origin', '*');
    res.send('pong');
  });

  express.get('/pings', userModule.auth('ADMIN'), express.crud.browseRoute.bind(null, app, Ping));
};
