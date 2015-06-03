// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../user',
  '../router',
  '../viewport',
  'i18n!app/nls/reports'
], function(
  user,
  router,
  viewport
) {
  'use strict';

  router.map('/reports/1', user.auth('REPORTS:VIEW', 'REPORTS:1:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report1')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report1Page', function(Report1Page)
    {
      return new Report1Page({
        query: req.query,
        displayOptions: req.fragment
      });
    });
  });

  router.map('/reports/2', user.auth('REPORTS:VIEW', 'REPORTS:2:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report2')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report2Page', function(Report2Page)
    {
      return new Report2Page({
        query: req.query,
        displayOptions: req.fragment
      });
    });
  });

  router.map('/reports/3', user.auth('REPORTS:VIEW', 'REPORTS:3:VIEW'), function(req)
  {
    viewport.loadPage('app/reports/pages/Report3Page', function(Report3Page)
    {
      return new Report3Page({query: req.rql});
    });
  });

  router.map('/reports/4', user.auth('REPORTS:VIEW', 'REPORTS:4:VIEW'), function(req)
  {
    viewport.loadPage('app/reports/pages/Report4Page', function(Report4Page)
    {
      return new Report4Page({query: req.query});
    });
  });

  router.map('/reports/5', user.auth('REPORTS:VIEW', 'REPORTS:5:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report5')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report5Page', function(Report5Page)
    {
      return new Report5Page({
        query: req.query,
        displayOptions: req.fragment
      });
    });
  });

  router.map('/reports/6', user.auth('REPORTS:VIEW', 'REPORTS:6:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report6')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report6Page', function(Report6Page)
    {
      return new Report6Page({
        query: req.query,
        displayOptions: req.fragment
      });
    });
  });

  router.map('/reports/7', user.auth('REPORTS:VIEW', 'REPORTS:7:VIEW'), function(req)
  {
    viewport.loadPage('app/reports/pages/Report7Page', function(Report7Page)
    {
      return new Report7Page({query: req.query});
    });
  });

  router.map('/reports;settings', user.auth('REPORTS:MANAGE'), function(req)
  {
    viewport.loadPage('app/reports/pages/ReportSettingsPage', function(ReportSettingsPage)
    {
      return new ReportSettingsPage({
        initialTab: req.query.tab
      });
    });
  });

});
