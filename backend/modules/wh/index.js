// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const setUpRoutes = require('./routes');
const setUpGenerator = require('./generator');
const setUpState = require('./state');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  updaterId: 'updater',
  generator: false
};

exports.start = function startWhModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.updaterId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );

  if (module.config.generator)
  {
    app.onModuleReady(
      [
        module.config.mongooseId,
        module.config.settingsId
      ],
      setUpGenerator.bind(null, app, module)
    );
  }
  else
  {
    app.onModuleReady(
      [
        module.config.mongooseId,
        module.config.userId,
        module.config.settingsId
      ],
      setUpState.bind(null, app, module)
    );
  }
};
