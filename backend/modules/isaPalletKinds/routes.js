// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpIsaPalletKindsRoutes(app, module, useDictionaryModel)
{
  var express = app[module.config.expressId];
  var auth = app[module.config.userId].auth;
  var IsaPalletKind = app[module.config.mongooseId].model('IsaPalletKind');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/isaPalletKinds', canView, express.crud.browseRoute.bind(null, app, IsaPalletKind));

  express.post('/isaPalletKinds', canManage, express.crud.addRoute.bind(null, app, IsaPalletKind));

  express.get('/isaPalletKinds/:id', canView, express.crud.readRoute.bind(null, app, IsaPalletKind));

  express.put(
    '/isaPalletKinds/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, IsaPalletKind)
  );

  express.delete(
    '/isaPalletKinds/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, IsaPalletKind)
  );
};
