// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startVendorNc12sModule(app, module)
{
  const config = module.config;

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
