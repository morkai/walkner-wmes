// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpAorsRoutes(app, aorsModule)
{
  var express = app[aorsModule.config.expressId];
  var auth = app[aorsModule.config.userId].auth;
  var Aor = app[aorsModule.config.mongooseId].model('Aor');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/aors', canView, express.crud.browseRoute.bind(null, app, Aor));

  express.post('/aors', canManage, express.crud.addRoute.bind(null, app, Aor));

  express.get('/aors/:id', canView, express.crud.readRoute.bind(null, app, Aor));

  express.put('/aors/:id', canManage, express.crud.editRoute.bind(null, app, Aor));

  express.delete('/aors/:id', canManage, express.crud.deleteRoute.bind(null, app, Aor));
};
