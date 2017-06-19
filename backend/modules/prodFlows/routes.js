// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdFlowsRoutes(app, prodFlowsModule, useDictionaryModel)
{
  const express = app[prodFlowsModule.config.expressId];
  const auth = app[prodFlowsModule.config.userId].auth;
  const ProdFlow = app[prodFlowsModule.config.mongooseId].model('ProdFlow');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodFlows', canView, express.crud.browseRoute.bind(null, app, ProdFlow));

  express.post('/prodFlows', canManage, express.crud.addRoute.bind(null, app, ProdFlow));

  express.get('/prodFlows/:id', canView, express.crud.readRoute.bind(null, app, ProdFlow));

  express.put('/prodFlows/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, ProdFlow));

  express.delete('/prodFlows/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, ProdFlow));
};
