// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var crud = require('../express/crud');

module.exports = function setUpDiagRoutes(app, diagModule)
{
  var express = app[diagModule.config.expressId];
  var auth = app[diagModule.config.userId].auth;
  var DiagLogEntry = app[diagModule.config.mongooseId].model('DiagLogEntry');

  var canView = auth('DIAG:VIEW');

  express.get('/diag/logs', canView, crud.browseRoute.bind(null, app, DiagLogEntry));
};
