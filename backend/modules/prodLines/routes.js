// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpProdLinesRoutes(app, prodLinesModule)
{
  var express = app[prodLinesModule.config.expressId];
  var auth = app[prodLinesModule.config.userId].auth;
  var ProdLine = app[prodLinesModule.config.mongooseId].model('ProdLine');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodLines', canView, crud.browseRoute.bind(null, app, ProdLine));

  express.post('/prodLines', canManage, crud.addRoute.bind(null, app, ProdLine));

  express.get('/prodLines/:id', canView, crud.readRoute.bind(null, app, ProdLine));

  express.put('/prodLines/:id', canManage, crud.editRoute.bind(null, app, ProdLine));

  express.del('/prodLines/:id', canManage, crud.deleteRoute.bind(null, app, ProdLine));
};
