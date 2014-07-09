// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function setUpDivisionsRoutes(app, divisionsModule)
{
  var express = app[divisionsModule.config.expressId];
  var auth = app[divisionsModule.config.userId].auth;
  var Division = app[divisionsModule.config.mongooseId].model('Division');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/divisions', canView, express.crud.browseRoute.bind(null, app, Division));

  express.post('/divisions', canManage, express.crud.addRoute.bind(null, app, Division));

  express.get('/divisions/:id', canView, express.crud.readRoute.bind(null, app, Division));

  express.put('/divisions/:id', canManage, express.crud.editRoute.bind(null, app, Division));

  express.delete('/divisions/:id', canManage, express.crud.deleteRoute.bind(null, app, Division));
};
