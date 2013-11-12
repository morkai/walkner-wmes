'use strict';

var crud = require('../express/crud');

module.exports = function setUpWorkCentersRoutes(app, workCentersModule)
{
  var express = app[workCentersModule.config.expressId];
  var auth = app[workCentersModule.config.userId].auth;
  var WorkCenter = app[workCentersModule.config.mongooseId].model('WorkCenter');

  var canView = auth('WORK_CENTERS:VIEW');
  var canManage = auth('WORK_CENTERS:MANAGE');

  express.get('/workCenters', canView, crud.browseRoute.bind(null, app, WorkCenter));

  express.post('/workCenters', canManage, crud.addRoute.bind(null, app, WorkCenter));

  express.get('/workCenters/:id', canView, crud.readRoute.bind(null, app, WorkCenter));

  express.put('/workCenters/:id', canManage, crud.editRoute.bind(null, app, WorkCenter));

  express.del('/workCenters/:id', canManage, crud.deleteRoute.bind(null, app, WorkCenter));
};
