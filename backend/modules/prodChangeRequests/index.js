// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  orgUnitsId: 'orgUnits',
  prodShiftsId: 'prodShifts',
  prodShiftOrdersId: 'prodShiftOrders',
  prodDowntimesId: 'prodDowntimes',
  fteId: 'fte'
};

exports.start = function startProdChangeRequestsModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.orgUnitsId,
      module.config.prodShiftsId,
      module.config.prodShiftOrdersId,
      module.config.prodDowntimesId,
      module.config.fteId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
