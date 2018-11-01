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
  settingsId: 'settings',
  generator: true
};

exports.start = function startPlanningModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
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

    const PlanSettings = app[module.config.mongooseId].model('PlanSettings');

    PlanSettings.find({_id: {$gte: planDate}}).sort({_id: 1}).limit(1).exec((err, settings) =>
    {
      if (err)
      {
        module.error(`Failed to find plan settings for generator request: ${err.message}`);
      }

      const freezeFirstShiftOrders = settings.length === 1 && settings[0].shouldFreezeFirstShiftOrders(30);

      if (freezeFirstShiftOrders || m.created || m.updated || m.removed)
      {
        app.broker.publish('planning.generator.requested', {
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

  app.broker.subscribe('orderDocuments.eto.synced', m =>
  {
    if (module.eto)
    {
      module.eto.add(m.nc12);
    }
  });
};
