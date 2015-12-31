// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

var findOrdersRoute = require('./findOrdersRoute');
var getProductionStateRoute = require('./getProductionStateRoute');
var getProductionHistoryRoute = require('./getProductionHistoryRoute');
var syncRoute = require('./syncRoute');

module.exports = function setUpProductionRoutes(app, productionModule)
{
  var express = app[productionModule.config.expressId];

  express.get('/production/orders', findOrdersRoute.bind(null, app, productionModule));
  express.get('/production/state', getProductionStateRoute.bind(null, app, productionModule));
  express.get('/production/history', getProductionHistoryRoute.bind(null, app, productionModule));
  express.post('/prodLogEntries', syncRoute.bind(null, app, productionModule));
};
