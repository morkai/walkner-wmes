// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  productionId: 'production',
  aorsId: 'aors',
  downtimeReasonsId: 'downtimeReasons',
  orgUnitsId: 'orgUnits'
};

exports.start = function startProdDowntimesModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.aorsId,
      module.config.downtimeReasonsId,
      module.config.orgUnitsId,
      module.config.productionId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.sioId,
      module.config.productionId
    ],
    setUpCommands.bind(null, app, module)
  );
};
