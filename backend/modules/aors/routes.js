'use strict';

var crud = require('../express/crud');

module.exports = function setUpAorsRoutes(app, aorsModule)
{
  var express = app[aorsModule.config.expressId];
  var auth = app[aorsModule.config.userId].auth;
  var Aor = app[aorsModule.config.mongooseId].model('Aor');

  var canView = auth('AORS:VIEW');
  var canManage = auth('AORS:MANAGE');

  express.get('/aors', canView, crud.browseRoute.bind(null, app, Aor));

  express.post('/aors', canManage, crud.addRoute.bind(null, app, Aor));

  express.get('/aors/:id', canView, crud.readRoute.bind(null, app, Aor));

  express.put('/aors/:id', canManage, crud.editRoute.bind(null, app, Aor));

  express.del('/aors/:id', canManage, crud.deleteRoute.bind(null, app, Aor));
};
