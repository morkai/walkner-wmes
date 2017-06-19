// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const addProdShift = require('./addProdShift');
const editProdShift = require('./editProdShift');
const deleteProdShift = require('./deleteProdShift');
const setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  orgUnitsId: 'orgUnits',
  productionId: 'production',
  settingsId: 'settings'
};

exports.start = function startProdShiftsModule(app, module)
{
  module.addProdShift = addProdShift.bind(null, app, module);
  module.editProdShift = editProdShift.bind(null, app, module);
  module.deleteProdShift = deleteProdShift.bind(null, app, module);

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.orgUnitsId,
      module.config.productionId,
      module.config.settingsId
    ],
    setUpRoutes.bind(null, app, module)
  );
};
