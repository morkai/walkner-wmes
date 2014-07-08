// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpMrpControllersRoutes(app, mrpControllersModule)
{
  var express = app[mrpControllersModule.config.expressId];
  var auth = app[mrpControllersModule.config.userId].auth;
  var MrpController = app[mrpControllersModule.config.mongooseId].model('MrpController');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/mrpControllers', canView, crud.browseRoute.bind(null, app, MrpController));

  express.post('/mrpControllers', canManage, crud.addRoute.bind(null, app, MrpController));

  express.get('/mrpControllers/:id', canView, crud.readRoute.bind(null, app, MrpController));

  express.put('/mrpControllers/:id', canManage, crud.editRoute.bind(null, app, MrpController));

  express.delete('/mrpControllers/:id', canManage, crud.deleteRoute.bind(null, app, MrpController));
};
