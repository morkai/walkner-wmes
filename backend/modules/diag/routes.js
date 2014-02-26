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
