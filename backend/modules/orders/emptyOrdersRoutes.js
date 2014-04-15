// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
