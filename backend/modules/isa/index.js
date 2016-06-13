// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpLineState = require('./lineState');
var setUpRoutes = require('./routes');
var setUpIsaShiftPersonnel = require('./shiftPersonnel');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  orgUnitsId: 'orgUnits',
  fteId: 'fte'
};

exports.start = function startIsaModule(app, module)
{
  var config = module.config;

  app.onModuleReady(
    [
      config.mongooseId,
      config.orgUnitsId,
      config.userId
    ],
    setUpLineState.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.userId,
      config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      config.mongooseId,
      config.fteId
    ],
    setUpIsaShiftPersonnel.bind(null, app, module)
  );
};
