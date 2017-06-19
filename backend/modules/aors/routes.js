// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpAorsRoutes(app, aorsModule, useDictionaryModel)
{
  var express = app[aorsModule.config.expressId];
  var auth = app[aorsModule.config.userId].auth;
  var Aor = app[aorsModule.config.mongooseId].model('Aor');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/aors', canView, express.crud.browseRoute.bind(null, app, Aor));

  express.post('/aors', canManage, express.crud.addRoute.bind(null, app, Aor));

  express.get('/aors/:id', canView, express.crud.readRoute.bind(null, app, Aor));

  express.put('/aors/:id', canManage, useDictionaryModel, express.crud.editRoute.bind(null, app, Aor));

  express.delete('/aors/:id', canManage, useDictionaryModel, express.crud.deleteRoute.bind(null, app, Aor));
};
