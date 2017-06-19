// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpVendorsRoutes(app, vendorsModule, useDictionaryModel)
{
  const express = app[vendorsModule.config.expressId];
  const auth = app[vendorsModule.config.userId].auth;
  const Vendor = app[vendorsModule.config.mongooseId].model('Vendor');

  const canView = auth('DICTIONARIES:VIEW');
  const canManage = auth('DICTIONARIES:MANAGE');

  express.get('/vendors', canView, express.crud.browseRoute.bind(null, app, Vendor));

  express.post('/vendors', canManage, express.crud.addRoute.bind(null, app, Vendor));

  express.get('/vendors/:id', canView, express.crud.readRoute.bind(null, app, Vendor));

  express.put('/vendors/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Vendor));

  express.delete('/vendors/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, Vendor));
};
