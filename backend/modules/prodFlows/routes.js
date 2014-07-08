// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpProdFlowsRoutes(app, prodFlowsModule)
{
  var express = app[prodFlowsModule.config.expressId];
  var auth = app[prodFlowsModule.config.userId].auth;
  var ProdFlow = app[prodFlowsModule.config.mongooseId].model('ProdFlow');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodFlows', canView, crud.browseRoute.bind(null, app, ProdFlow));

  express.post('/prodFlows', canManage, crud.addRoute.bind(null, app, ProdFlow));

  express.get('/prodFlows/:id', canView, crud.readRoute.bind(null, app, ProdFlow));

  express.put('/prodFlows/:id', canManage, crud.editRoute.bind(null, app, ProdFlow));

  express.delete('/prodFlows/:id', canManage, crud.deleteRoute.bind(null, app, ProdFlow));
};
