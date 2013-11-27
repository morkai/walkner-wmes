'use strict';

var crud = require('../express/crud');

module.exports = function setUpDivisionsRoutes(app, subdivisionsModule)
{
  var express = app[subdivisionsModule.config.expressId];
  var auth = app[subdivisionsModule.config.userId].auth;
  var Subdivision = app[subdivisionsModule.config.mongooseId].model('Subdivision');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/subdivisions', canView, crud.browseRoute.bind(null, app, Subdivision));

  express.post('/subdivisions', canManage, crud.addRoute.bind(null, app, Subdivision));

  express.get('/subdivisions/:id', canView, crud.readRoute.bind(null, app, Subdivision));

  express.put('/subdivisions/:id', canManage, crud.editRoute.bind(null, app, Subdivision));

  express.del('/subdivisions/:id', canManage, crud.deleteRoute.bind(null, app, Subdivision));
};
