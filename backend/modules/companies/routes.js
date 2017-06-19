// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpCompaniesRoutes(app, companiesModule, useDictionaryModel)
{
  const express = app[companiesModule.config.expressId];
  const auth = app[companiesModule.config.userId].auth;
  const Model = app[companiesModule.config.mongooseId].model('Company');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/companies', canView, express.crud.browseRoute.bind(null, app, Model));

  express.post('/companies', canManage, express.crud.addRoute.bind(null, app, Model));

  express.get('/companies/:id', canView, express.crud.readRoute.bind(null, app, Model));

  express.put('/companies/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Model));

  express.delete('/companies/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, Model));
};
