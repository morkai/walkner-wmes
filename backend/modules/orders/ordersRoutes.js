'use strict';

var crud = require('../express/crud');

module.exports = function setUpOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var Order = app[ordersModule.config.mongooseId].model('Order');

  express.get('/orders', crud.browseRoute.bind(null, app, Order));

  express.get('/orders/:id', crud.readRoute.bind(null, app, Order));
};
