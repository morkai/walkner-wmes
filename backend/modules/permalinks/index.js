// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express'
};

exports.start = function startPermalinksModule(app, module)
{
  var config = module.config;

  app.onModuleReady(
    [
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
