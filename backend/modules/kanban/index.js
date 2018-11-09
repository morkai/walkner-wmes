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
  sapImporterMessengerId: 'messenger/client',
  html2pdfId: 'html2pdf',
  containerImagesDest: './data/kanban/containers'
};

exports.start = function startKanbanModule(app, module)
{
  module.importTimer = null;

  module.printing = null;

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

  app.broker.subscribe('app.started').setLimit(1).on('message', () =>
  {
    const mongoose = app[module.config.mongooseId];

    mongoose.model('KanbanPrintQueue').collection.updateMany(
      {'jobs.status': 'printing'},
      {$set: {'jobs.$.status': 'failure'}},
      err =>
      {
        if (err)
        {
          module.error(`Failed to fail interrupted jobs: ${err.message}`);
        }
      }
    );

    mongoose.model('KanbanEntry').deleteMany({deleted: true}, err =>
    {
      if (err)
      {
        module.error(`Failed to remove deleted entries: ${err.message}`);
      }
    });
  });
};
