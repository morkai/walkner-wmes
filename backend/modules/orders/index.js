'use strict';

var setUpOrdersRoutes = require('./ordersRoutes');
var setUpMechOrdersRoutes = require('./mechOrdersRoutes');
var setUpEmptyOrdersRoutes = require('./emptyOrdersRoutes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startOrdersModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    function()
    {
      setUpOrdersRoutes(app, module);
      setUpMechOrdersRoutes(app, module);
      setUpEmptyOrdersRoutes(app, module);
    }
  );
};
