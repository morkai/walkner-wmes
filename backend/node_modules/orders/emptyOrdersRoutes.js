// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpEmptyOrdersRoutes(app, ordersModule)
{
  const express = app[ordersModule.config.expressId];
  const auth = app[ordersModule.config.userId].auth;
  const EmptyOrder = app[ordersModule.config.mongooseId].model('EmptyOrder');

  const canView = auth('ORDERS:VIEW');

  express.get('/emptyOrders', canView, express.crud.browseRoute.bind(null, app, EmptyOrder));
};
