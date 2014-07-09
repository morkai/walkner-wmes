// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpProdLinesRoutes(app, prodLinesModule)
{
  var express = app[prodLinesModule.config.expressId];
  var auth = app[prodLinesModule.config.userId].auth;
  var ProdLine = app[prodLinesModule.config.mongooseId].model('ProdLine');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/prodLines', canView, express.crud.browseRoute.bind(null, app, ProdLine));

  express.post('/prodLines', canManage, express.crud.addRoute.bind(null, app, ProdLine));

  express.get('/prodLines/:id', canView, express.crud.readRoute.bind(null, app, ProdLine));

  express.put('/prodLines/:id', canManage, express.crud.editRoute.bind(null, app, ProdLine));

  express.delete('/prodLines/:id', canManage, express.crud.deleteRoute.bind(null, app, ProdLine));
};
