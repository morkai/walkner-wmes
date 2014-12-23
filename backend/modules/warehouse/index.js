// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  importPath: './',
  ccImportFile: '{timestamp}@T_LS41_{step}.txt',
  toImportFile: '{timestamp}@T_LT23_{step}.txt'
};

exports.start = function startWarehouseModule(app, poModule)
{
  app.onModuleReady(
    [
      poModule.config.expressId
    ],
    setUpRoutes.bind(null, app, poModule)
  );
};
