// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpCompaniesRoutes(app, companiesModule)
{
  var express = app[companiesModule.config.expressId];
  var auth = app[companiesModule.config.userId].auth;
  var Model = app[companiesModule.config.mongooseId].model('Company');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/companies', canView, express.crud.browseRoute.bind(null, app, Model));

  express.post('/companies', canManage, express.crud.addRoute.bind(null, app, Model));

  express.get('/companies/:id', canView, express.crud.readRoute.bind(null, app, Model));

  express.put('/companies/:id', canManage, express.crud.editRoute.bind(null, app, Model));

  express.delete('/companies/:id', canManage, express.crud.deleteRoute.bind(null, app, Model));
};
