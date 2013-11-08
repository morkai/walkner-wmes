'use strict';

var setUpOrderStatusesRoutes = require('./orderStatusesRoutes');
var setUpOrdersRoutes = require('./ordersRoutes');
var setUpOrdersImporter = require('./importer');

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

  app.onModuleReady(
    module.config.mongooseId,
    setUpOrdersImporter.bind(null, app, module)
  );
};
