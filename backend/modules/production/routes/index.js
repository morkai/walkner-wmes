// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var findOrdersRoute = require('./findOrdersRoute');
var getProductionStateRoute = require('./getProductionStateRoute');
var getProductionHistoryRoute = require('./getProductionHistoryRoute');

module.exports = function setUpProductionRoutes(app, productionModule)
{
  var express = app[productionModule.config.expressId];

  express.get('/production/orders', findOrdersRoute.bind(null, app, productionModule));
  express.get('/production/state', getProductionStateRoute.bind(null, app, productionModule));
  express.get('/production/history', getProductionHistoryRoute.bind(null, app, productionModule));
};
