// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpProdFunctionsRoutes(app, prodFunctionsModule, useDictionaryModel)
{
  var express = app[prodFunctionsModule.config.expressId];
  var auth = app[prodFunctionsModule.config.userId].auth;
  var ProdFunction = app[prodFunctionsModule.config.mongooseId].model('ProdFunction');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodFunctions', canView, express.crud.browseRoute.bind(null, app, ProdFunction));

  express.post('/prodFunctions', canManage, express.crud.addRoute.bind(null, app, ProdFunction));

  express.get('/prodFunctions/:id', canView, express.crud.readRoute.bind(null, app, ProdFunction));

  express.put(
    '/prodFunctions/:id',
    canManage,
    useDictionaryModel,
    express.crud.editRoute.bind(null, app, ProdFunction)
  );

  express.delete(
    '/prodFunctions/:id',
    canManage,
    useDictionaryModel,
    express.crud.deleteRoute.bind(null, app, ProdFunction)
  );
};
