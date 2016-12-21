// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  updaterId: 'updater',
  mongooseId: 'mongoose',
  fteId: 'fte',
  userId: 'user'
};

exports.start = function startHeffModule(app, module)
{
  app.onModuleReady(
    [
      module.config.expressId,
      module.config.updaterId,
      module.config.mongooseId,
      module.config.fteId,
      module.config.userId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('production.synced.**', function(message)
  {
    if (message.types.includes('changeQuantitiesDone')
      || message.types.includes('changeShift'))
    {
      app.broker.publish('heff.reload.' + message.prodLine, {});
    }
  });

  app.broker.subscribe('hourlyPlans.quantitiesPlanned', function(message)
  {
    app.broker.publish('heff.reload.' + message.prodLine, {});
  });

  app.broker.subscribe('heffLineStates.**', function(message)
  {
    app.broker.publish('heff.reload.' + message.model._id, {});
  });
};
