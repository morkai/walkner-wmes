// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const setUpRoutes = require('./routes');
const setUpGenerator = require('./generator');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  userId: 'user',
  expressId: 'express',
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
        dayAfterTomorrow: (now.hours() === 16 && now.minutes() > 30) || now.hours() >= 17
      });
    }
  });

  app.broker.subscribe('planning.settings.updated', m =>
  {
    app.broker.publish('planning.generator.requested', {
      date: moment.utc(m._id).format('YYYY-MM-DD')
    });
  });
};
