'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  prodLinesId: 'prodLines'
};

exports.start = function startProdShiftOrdersModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.prodLinesId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
