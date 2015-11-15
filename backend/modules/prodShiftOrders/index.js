// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var validateOverlappingOrders = require('./validateOverlappingOrders');
var addProdShiftOrder = require('./addProdShiftOrder');
var editProdShiftOrder = require('./editProdShiftOrder');
var deleteProdShiftOrder = require('./deleteProdShiftOrder');
var setUpRoutes = require('./routes');
var setUpNoOperationsFix = require('./noOperationsFix');

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
