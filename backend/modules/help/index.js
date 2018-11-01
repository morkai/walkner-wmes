// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpGdrive = require('./gdrive');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  mongooseId: 'mongoose',
  userId: 'user',
  settingsId: 'settings',
  gdriveId: 'gdrive',
  dataPath: './data/help'
};

exports.start = function startHelpModule(app, module)
{
  app.onModuleReady(
    [
      module.config.expressId,
      module.config.mongooseId,
      module.config.userId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.gdriveId
    ],
    setUpGdrive.bind(null, app, module)
  );
};
