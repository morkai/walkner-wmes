'use strict';

var setUpOrderStatusesRoutes = require('./orderStatusesRoutes');
var setUpOrdersRoutes = require('./ordersRoutes');

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
      setUpOrderStatusesRoutes(app, module);
      setUpOrdersRoutes(app, module);
    }
  );
};
