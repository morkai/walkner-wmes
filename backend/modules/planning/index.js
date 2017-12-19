// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const setUpRoutes = require('./routes');
const setUpGenerator = require('./generator');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  userId: 'user',
  expressId: 'express',
  ordersId: 'orders',
  generator: true
};

exports.start = function startPlanningModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpGenerator.bind(null, app, module)
  );

  app.broker.subscribe('orders.synced', m =>
  {
    if (m.created || m.updated || m.removed)
    {
      const now = moment();

      app.broker.publish('planning.generator.requested', {
        forceDayAfterTomorrow: (now.hours() === 16 && now.minutes() > 30) || now.hours() >= 17,
        freezeFirstShiftOrders: (now.hours() === 22 && now.minutes() && 30) || now.hours() >= 23 || now.hours < 6
      });
    }
  });

  app.broker.subscribe('settings.updated.production.lineAutoDowntimes', () =>
  {
    app.broker.publish('planning.generator.requested', {
      reloadAutoDowntimes: true
    });
  });

  app.broker.subscribe('subdivisions.edited', () =>
  {
    app.broker.publish('planning.generator.requested', {
      reloadAutoDowntimes: true
    });
  });

  app.broker.subscribe('planning.settings.updated', m =>
  {
    if (Array.isArray(m.changes) && m.changes.length)
    {
      app.broker.publish('planning.generator.requested', {
        date: m.date
      });
    }
  });
};
