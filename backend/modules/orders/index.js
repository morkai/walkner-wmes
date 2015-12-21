// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpOrdersRoutes = require('./ordersRoutes');
var setUpMechOrdersRoutes = require('./mechOrdersRoutes');
var setUpEmptyOrdersRoutes = require('./emptyOrdersRoutes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  settingsId: 'settings',
  importPath: './',
  zintExe: 'zint'
};

exports.start = function startOrdersModule(app, module)
{
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId,
      module.config.settingsId
    ],
    function()
    {
      setUpOrdersRoutes(app, module);
      setUpMechOrdersRoutes(app, module);
      setUpEmptyOrdersRoutes(app, module);
    }
  );
};
