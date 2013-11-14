'use strict';

var crud = require('../express/crud');

module.exports = function setUpEmptyOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var EmptyOrder = app[ordersModule.config.mongooseId].model('EmptyOrder');

  var canView = auth('ORDERS:VIEW');

  express.get('/emptyOrders', canView, crud.browseRoute.bind(null, app, EmptyOrder));
};
