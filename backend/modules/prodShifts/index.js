// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var addProdShift = require('./addProdShift');
var editProdShift = require('./editProdShift');
var deleteProdShift = require('./deleteProdShift');
var setUpRoutes = require('./routes');

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
