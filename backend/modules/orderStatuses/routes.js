// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpOrderStatusesRoutes(app, ordersModule)
{
  var express = app[ordersModule.config.expressId];
  var auth = app[ordersModule.config.userId].auth;
  var Model = app[ordersModule.config.mongooseId].model('OrderStatus');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/orderStatuses', canView, crud.browseRoute.bind(null, app, Model));

  express.post('/orderStatuses', canManage, crud.addRoute.bind(null, app, Model));

  express.get('/orderStatuses/:id', canView, crud.readRoute.bind(null, app, Model));

  express.put('/orderStatuses/:id', canManage, crud.editRoute.bind(null, app, Model));

  express.del('/orderStatuses/:id', canManage, crud.deleteRoute.bind(null, app, Model));
};
