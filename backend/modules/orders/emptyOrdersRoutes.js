// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpEmptyOrdersRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var EmptyOrder = app[ordersModule.config.mongooseId].model('EmptyOrder');

  var canView = auth('ORDERS:VIEW');

  express.get('/emptyOrders', canView, express.crud.browseRoute.bind(null, app, EmptyOrder));
};
