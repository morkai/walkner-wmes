'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  workCentersId: 'workCenters',
  prodLinesId: 'prodLines'
};

exports.start = function startProdLogEntriesModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.workCentersId,
      module.config.prodLinesId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
