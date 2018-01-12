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
    const now = moment();
    const planDate = moment.utc(now.format('YYYY-MM-DD'), 'YYYY-MM-DD');

    if (now.hours() >= 6)
    {
      planDate.add(1, 'days');
    }

    app[module.config.mongooseId].find({_id: {$gte: planDate}}).sort({_id: 1}).limit(1).exec((err, plans) =>
    {
      if (err)
      {
        module.error(`Failed to find plan settings for generator request: ${err.message}`);
      }

      const freezeFirstShiftOrders = plans.length === 1 && plans[0].shouldFreezeFirstShiftOrders(30);

      if (freezeFirstShiftOrders || m.created || m.updated || m.removed)
      {
        const now = moment();

        app.broker.publish('planning.generator.requested', {
          forceDayAfterTomorrow: (now.hours() === 16 && now.minutes() > 30) || now.hours() >= 17,
          freezeFirstShiftOrders
        });
      }
    });
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
