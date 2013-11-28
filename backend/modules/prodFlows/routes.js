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

  express.del('/prodFlows/:id', canManage, crud.deleteRoute.bind(null, app, ProdFlow));
};
