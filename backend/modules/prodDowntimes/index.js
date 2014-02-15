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
  subdivisionsId: 'subdivisions',
  prodFlowsId: 'prodFlows',
  workCentersId: 'workCenters',
  prodLinesId: 'prodLines'
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
      module.config.subdivisionsId,
      module.config.prodFlowsId,
      module.config.workCentersId,
      module.config.prodLinesId
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
