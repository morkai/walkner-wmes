'use strict';

var crud = require('../express/crud');

module.exports = function setUpOrderStatusesRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var OrderStatus = app[ordersModule.config.mongooseId].model('OrderStatus');

  var canView = auth('ORDERS:VIEW');
  var canManage = auth('ORDERS:MANAGE');

  express.get(
    '/orderStatuses', canView, crud.browseRoute.bind(null, app, OrderStatus)
  );

  express.post(
    '/orderStatuses', canManage, crud.addRoute.bind(null, app, OrderStatus)
  );

  express.get(
    '/orderStatuses/:id', canView, crud.readRoute.bind(null, app, OrderStatus)
  );

  express.put(
    '/orderStatuses/:id', canManage, crud.editRoute.bind(null, app, OrderStatus)
  );

  express.del(
    '/orderStatuses/:id',
    canManage,
    crud.deleteRoute.bind(null, app, OrderStatus)
  );

};
