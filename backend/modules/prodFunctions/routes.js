// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpProdFunctionsRoutes(app, prodFunctionsModule)
{
  var express = app[prodFunctionsModule.config.expressId];
  var auth = app[prodFunctionsModule.config.userId].auth;
  var ProdFunction = app[prodFunctionsModule.config.mongooseId].model('ProdFunction');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodFunctions', canView, crud.browseRoute.bind(null, app, ProdFunction));

  express.post('/prodFunctions', canManage, crud.addRoute.bind(null, app, ProdFunction));

  express.get('/prodFunctions/:id', canView, crud.readRoute.bind(null, app, ProdFunction));

  express.put('/prodFunctions/:id', canManage, crud.editRoute.bind(null, app, ProdFunction));

  express.del('/prodFunctions/:id', canManage, crud.deleteRoute.bind(null, app, ProdFunction));
};
