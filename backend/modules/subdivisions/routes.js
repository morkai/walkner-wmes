// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpSubdivisionsRoutes(app, subdivisionsModule)
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
