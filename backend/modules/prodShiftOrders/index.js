// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const validateOverlappingOrders = require('./validateOverlappingOrders');
const addProdShiftOrder = require('./addProdShiftOrder');
const editProdShiftOrder = require('./editProdShiftOrder');
const deleteProdShiftOrder = require('./deleteProdShiftOrder');
const setUpRoutes = require('./routes');
const setUpNoOperationsFix = require('./noOperationsFix');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  orgUnitsId: 'orgUnits',
  productionId: 'production',
  fteId: 'fte'
};

exports.start = function startProdShiftOrdersModule(app, module)
{
  module.validateOverlappingOrders = validateOverlappingOrders.bind(null, app, module);
  module.addProdShiftOrder = addProdShiftOrder.bind(null, app, module);
  module.editProdShiftOrder = editProdShiftOrder.bind(null, app, module);
  module.deleteProdShiftOrder = deleteProdShiftOrder.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.expressId,
      module.config.userId,
      module.config.orgUnitsId,
      module.config.productionId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.fteId
    ],
    setUpNoOperationsFix.bind(null, app, module)
  );
};
