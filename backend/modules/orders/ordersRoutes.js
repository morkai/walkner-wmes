'use strict';

var crud = require('../express/crud');

module.exports = function setUpOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var Order = app[ordersModule.config.mongooseId].model('Order');

  var canView = auth('ORDERS:VIEW');

  express.get('/orders', canView, crud.browseRoute.bind(null, app, Order));

  express.get('/orders/:id', canView, crud.readRoute.bind(null, app, Order));
};
