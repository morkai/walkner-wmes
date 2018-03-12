// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');
const multer = require('multer');
const helpers = require('./helpers');
const exportRoute = require('./export');

module.exports = function setUpReportsRoutes(app, reportsModule)
{
  const express = app[reportsModule.config.expressId];
  const userModule = app[reportsModule.config.userId];
  const settings = app[reportsModule.config.settingsId];

  const downloads = {};

  const canView = userModule.auth('REPORTS:*');
  const canManage = userModule.auth('REPORTS:MANAGE');

  if (_.includes(reportsModule.config.reports, '1'))
  {
    const canViewReport1 = userModule.auth('REPORTS:VIEW', 'REPORTS:1:VIEW');

    express.get(
      '/reports/1',
      canViewReport1,
      helpers.sendCachedReport.bind(null, '1'),
      require('./report1').bind(null, app, reportsModule)
    );

    express.get(
      '/reports/1;export.:format?',
      canViewReport1,
      require('./report1Export').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '2'))
  {
    const canViewReport2 = userModule.auth('REPORTS:VIEW', 'REPORTS:2:VIEW');

    express.get(
      '/reports/2',
      canViewReport2,
      helpers.sendCachedReport.bind(null, '2'),
      require('./report2').bind(null, app, reportsModule)
    );

    express.get(
      '/reports/2/orders',
      canViewReport2,
      require('./report2Orders').bind(null, app, reportsModule)
    );

    express.get(
      '/reports/2/orders;export.:format?',
      canViewReport2,
      require('./report2Export').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, 'clip'))
  {
    const canViewReport2 = userModule.auth('REPORTS:VIEW', 'REPORTS:2:VIEW');

    express.get(
      '/reports/clip',
      canViewReport2,
      helpers.sendCachedReport.bind(null, 'clip'),
      require('./clip').bind(null, app, reportsModule)
    );

    express.get(
      '/reports/clip/orders',
      canViewReport2,
      require('./clipOrders').bind(null, app, reportsModule)
    );

    express.get(
      '/reports/clip/orders;export.:format?',
      canViewReport2,
      require('./clipExport').bind(null, app, reportsModule)
    );

    express.get(
      '/reports/clip/planners',
      canViewReport2,
      require('./clipPlanners').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '3'))
  {
    express.get(
      '/reports/3',
      userModule.auth('REPORTS:VIEW', 'REPORTS:3:VIEW'),
      helpers.sendCachedReport.bind(null, '3'),
      require('./report3').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '4'))
  {
    const canViewReport4 = userModule.auth('REPORTS:VIEW', 'REPORTS:4:VIEW');

    express.get(
      '/reports/4',
      canViewReport4,
      helpers.sendCachedReport.bind(null, '4'),
      require('./report4').bind(null, app, reportsModule)
    );

    express.get('/reports/4;notes', canViewReport4, require('./report4Notes').bind(null, app, reportsModule));

    express.post('/reports/4;notes', canViewReport4, require('./report4Notes').bind(null, app, reportsModule));
  }

  if (_.includes(reportsModule.config.reports, '5'))
  {
    express.get(
      '/reports/5',
      userModule.auth('REPORTS:VIEW', 'REPORTS:5:VIEW'),
      helpers.sendCachedReport.bind(null, '5'),
      require('./report5').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '6'))
  {
    express.get(
      '/reports/6',
      userModule.auth('REPORTS:VIEW', 'REPORTS:6:VIEW'),
      helpers.sendCachedReport.bind(null, '6'),
      require('./report6').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '7'))
  {
    express.get(
      '/reports/7',
      userModule.auth('REPORTS:VIEW', 'REPORTS:7:VIEW'),
      helpers.sendCachedReport.bind(null, '7'),
      require('./report7').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '8'))
  {
    express.get(
      '/reports/8',
      userModule.auth('REPORTS:VIEW', 'REPORTS:8:VIEW'),
      helpers.sendCachedReport.bind(null, '8'),
      require('./report8').bind(null, app, reportsModule)
    );
  }

  if (_.includes(reportsModule.config.reports, '9'))
  {
    express.get(
      '/reports/9',
      userModule.auth('REPORTS:VIEW', 'REPORTS:9:VIEW'),
      helpers.sendCachedReport.bind(null, '9'),
      require('./report9').bind(null, app, reportsModule)
    );
  }

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
    express.post(
      '/reports;export',
      multer({
        limits: {
          files: 0
        }
      }).any(),
      exportRoute.bind(null, reportsModule)
    );
  }

  express.post('/reports;download', function(req, res)
  {
    if (!req.query.filename || !req.is('text/csv'))
    {
      return res.sendStatus(400);
    }

    const key = (Date.now() + Math.random()).toString();

    downloads[key] = {
      filename: req.query.filename + '.csv',
      body: Buffer.concat([new Buffer([0xEF, 0xBB, 0xBF]), new Buffer(req.body, 'utf8')]),
      timer: setTimeout(function() { delete downloads[key]; }, 30000)
    };

    res.send(key);
  });

  express.get('/reports;download', function(req, res)
  {
    const key = req.query.key;

    if (!key)
    {
      return res.sendStatus(400);
    }

    const download = downloads[key];

    if (!download)
    {
      return res.sendStatus(404);
    }

    clearTimeout(download.timer);

    delete downloads[key];

    res.attachment(download.filename);
    res.end(download.body);
  });
};
