// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var importRoute = require('./importRoute');

module.exports = function setUpWarehouseRoutes(app, poModule)
{
  var express = app[poModule.config.expressId];

  express.post(
    '/warehouse;import',
    importRoute.bind(null, app, poModule)
  );
};
