// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var multipart = require('express').multipart;
var helpers = require('./helpers');
var exportRoute = require('./export');
var report1Route = require('./report1');
var report2Route = require('./report2');
var report3Route = require('./report3');
var report4Route = require('./report4');

module.exports = function setUpReportsRoutes(app, reportsModule)
{
  var express = app[reportsModule.config.expressId];
  var userModule = app[reportsModule.config.userId];
  var settings = app[reportsModule.config.settingsId];

  var canView = userModule.auth('REPORTS:VIEW');
  var canManage = userModule.auth('REPORTS:MANAGE');

  express.get(
    '/reports/1', canView, helpers.sendCachedReport, report1Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/2', canView, helpers.sendCachedReport, report2Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/3', canView, helpers.sendCachedReport, report3Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/4', canView, helpers.sendCachedReport, report4Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/metricRefs',
    canView,
    function limitToMetricRefs(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^metricRefs\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/reports/metricRefs/:id', canManage, settings.updateRoute);

  if (reportsModule.config.javaBatik)
  {
    express.post('/reports;export', canView, multipart(), exportRoute.bind(null, reportsModule));
  }
};
