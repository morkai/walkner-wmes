// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startSubscriptionsModule(app, module)
{
  const {config} = module;

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('users.deleted', message =>
  {
    const mongoose = app[module.mongooseId];

    if (!mongoose)
    {
      return;
    }

    mongoose.model('Subscription').deleteMany({user: message.model._id.toString()}, err =>
    {
      if (err)
      {
        module.error(`Failed to delete subscriptions of user [${message.model._id}]: ${err.message}`);
      }
    });
  });
};
