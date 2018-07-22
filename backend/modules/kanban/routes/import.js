// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function importRoute(app, module, req, res, next)
{
  const sapGuiModule = app[module.config.sapGuiId];

  if (!sapGuiModule)
  {
    return next(app.createError('Import feature is disabled.', 'DISABLED', 500));
  }

  if (module.importTimer)
  {
    return next(app.createError('Import in progress.', 'IN_PROGRESS', 400));
  }

  const settingsModule = app[module.config.settingsId];
  const mongoose = app[module.config.mongooseId];
  const KanbanSupplyArea = mongoose.model('KanbanSupplyArea');

  module.importTimer = app.timeout(15 * 60 * 1000, () => module.importTimer = null);

  step(
    function()
    {
      KanbanSupplyArea.find({}, {_id: 1}).lean().exec(this.parallel());

      settingsModule.findValues('kanban.', this.parallel());
    },
    function(err, supplyAreas, settings)
    {
      if (err)
      {
        return next(err);
      }

      const kanbanJob = {
        name: 'kanban',
        scriptTimeout: 10 * 60 * 1000,
        repeatOnFailure: 0,
        supplyAreas: supplyAreas.map(d => d._id),
        pkhdStorageType: settings['import.pkhdStorageType'] || '151',
        maktLanguage: settings['import.maktLanguage'] || 'PL',
        mlgtWarehouseNo: settings['import.mlgtWarehouseNo'] || 'KZ1',
        mlgtStorageType: settings['import.mlgtStorageType'] || '851',
        waitForResult: false
      };

      sapGuiModule.runRemoteJob(kanbanJob, err =>
      {
        if (err)
        {
          clearTimeout(module.importTimer);
          module.importTimer = null;

          return next(err);
        }

        res.sendStatus(204);
      });
    }
  );
};
