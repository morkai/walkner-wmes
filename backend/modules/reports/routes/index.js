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
var report4NotesRoute = require('./report4Notes');
var report5Route = require('./report5');

module.exports = function setUpReportsRoutes(app, reportsModule)
{
  var express = app[reportsModule.config.expressId];
  var userModule = app[reportsModule.config.userId];
  var settings = app[reportsModule.config.settingsId];

  var downloads = {};

  var canView = userModule.auth('REPORTS:VIEW');
  var canManage = userModule.auth('REPORTS:MANAGE');

  express.get(
    '/reports/1',
    canView,
    helpers.sendCachedReport.bind(null, '1'),
    report1Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/2',
    canView,
    helpers.sendCachedReport.bind(null, '2'),
    report2Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/3',
    canView,
    helpers.sendCachedReport.bind(null, '3'),
    report3Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/4',
    canView,
    helpers.sendCachedReport.bind(null, '4'),
    report4Route.bind(null, app, reportsModule)
  );

  express.get('/reports/4;notes', canView, report4NotesRoute.bind(null, app, reportsModule));

  express.post('/reports/4;notes', canView, report4NotesRoute.bind(null, app, reportsModule));

  express.get(
    '/reports/5',
    canView,
    helpers.sendCachedReport.bind(null, '5'),
    report5Route.bind(null, app, reportsModule)
  );

  express.get(
    '/reports/settings',
    canView,
    function limitToReportSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^reports\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );

  express.put('/reports/settings/:id', canManage, settings.updateRoute);

  if (reportsModule.config.javaBatik)
  {
    express.post('/reports;export', canView, multipart(), exportRoute.bind(null, reportsModule));
  }

  express.post('/reports;download', canView, function(req, res)
  {
    if (!req.query.filename || !req.is('text/csv'))
    {
      return res.send(400);
    }

    var key = (Date.now() + Math.random()).toString();

    downloads[key] = {
      filename: req.query.filename + '.csv',
      body: Buffer.concat([new Buffer([0xEF, 0xBB, 0xBF]), new Buffer(req.body, 'utf8')]),
      timer: setTimeout(function() { delete downloads[key]; }, 30000)
    };

    res.send(key);
  });

  express.get('/reports;download', function(req, res)
  {
    var key = req.query.key;

    if (!key)
    {
      return res.send(400);
    }

    var download = downloads[key];

    if (!download)
    {
      return res.send(404);
    }

    clearTimeout(download.timer);

    delete downloads[key];

    res.attachment(download.filename);
    res.end(download.body);
  });
};
