// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startBehaviorObsCardsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.expressId,
      module.config.userId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
