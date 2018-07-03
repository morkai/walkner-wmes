// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpState = require('./state');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sapGuiId: 'sapGui',
  settingsId: 'settings',
  sapImporterMessengerId: 'messenger/client'
};

exports.start = function startKanbanModule(app, module)
{
  module.importTimer = null;

  app.onModuleReady(
    [
      module.config.mongooseId
    ],
    setUpState.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.broker.subscribe('kanban.import.*', () =>
  {
    clearTimeout(module.importTimer);
    module.importTimer = null;
  });
};
