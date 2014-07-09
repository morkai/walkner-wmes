// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpWorkCentersRoutes(app, workCentersModule)
{
  var express = app[workCentersModule.config.expressId];
  var auth = app[workCentersModule.config.userId].auth;
  var WorkCenter = app[workCentersModule.config.mongooseId].model('WorkCenter');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/workCenters', canView, express.crud.browseRoute.bind(null, app, WorkCenter));

  express.post('/workCenters', canManage, express.crud.addRoute.bind(null, app, WorkCenter));

  express.get('/workCenters/:id', canView, express.crud.readRoute.bind(null, app, WorkCenter));

  express.put('/workCenters/:id', canManage, express.crud.editRoute.bind(null, app, WorkCenter));

  express.delete('/workCenters/:id', canManage, express.crud.deleteRoute.bind(null, app, WorkCenter));
};
