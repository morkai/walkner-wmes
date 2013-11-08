'use strict';

var crud = require('../express/crud');

module.exports = function setUpDowntimeReasonsRoutes(app, downtimeReasonsModule)
{
  var express = app[downtimeReasonsModule.config.expressId];
  var auth = app[downtimeReasonsModule.config.userId].auth;
  var DowntimeReason = app[downtimeReasonsModule.config.mongooseId].model('DowntimeReason');

  var canView = auth('DOWNTIME_REASONS:VIEW');
  var canManage = auth('DOWNTIME_REASONS:MANAGE');

  express.get('/downtimeReasons', canView, crud.browseRoute.bind(null, app, DowntimeReason));

  express.post('/downtimeReasons', canManage, crud.addRoute.bind(null, app, DowntimeReason));

  express.get('/downtimeReasons/:id', canView, crud.readRoute.bind(null, app, DowntimeReason));

  express.put('/downtimeReasons/:id', canManage, crud.editRoute.bind(null, app, DowntimeReason));

  express.del('/downtimeReasons/:id', canManage, crud.deleteRoute.bind(null, app, DowntimeReason));
};
