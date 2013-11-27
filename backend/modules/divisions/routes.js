'use strict';

var crud = require('../express/crud');

module.exports = function setUpDivisionsRoutes(app, divisionsModule)
{
  var express = app[divisionsModule.config.expressId];
  var auth = app[divisionsModule.config.userId].auth;
  var Division = app[divisionsModule.config.mongooseId].model('Division');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/divisions', canView, crud.browseRoute.bind(null, app, Division));

  express.post('/divisions', canManage, crud.addRoute.bind(null, app, Division));

  express.get('/divisions/:id', canView, crud.readRoute.bind(null, app, Division));

  express.put('/divisions/:id', canManage, crud.editRoute.bind(null, app, Division));

  express.del('/divisions/:id', canManage, crud.deleteRoute.bind(null, app, Division));
};
