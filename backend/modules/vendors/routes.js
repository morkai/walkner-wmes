// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpVendorsRoutes(app, vendorsModule)
{
  var express = app[vendorsModule.config.expressId];
  var auth = app[vendorsModule.config.userId].auth;
  var Vendor = app[vendorsModule.config.mongooseId].model('Vendor');

  var canView = auth('DICTIONARIES:VIEW');
  var canManage = auth('DICTIONARIES:MANAGE');

  express.get('/vendors', canView, crud.browseRoute.bind(null, app, Vendor));

  express.post('/vendors', canManage, crud.addRoute.bind(null, app, Vendor));

  express.get('/vendors/:id', canView, crud.readRoute.bind(null, app, Vendor));

  express.put('/vendors/:id', canManage, crud.editRoute.bind(null, app, Vendor));

  express.del('/vendors/:id', canManage, crud.deleteRoute.bind(null, app, Vendor));
};
