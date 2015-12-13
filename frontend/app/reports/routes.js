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

  function loadReportPage(reportNo, req)
  {
    viewport.loadPage('app/reports/pages/Report' + reportNo + 'Page', function(ReportPage)
    {
      return new ReportPage({
        query: req.query,
        displayOptions: req.fragment
      });
    });
  }

  function auth(reportNo)
  {
    return user.auth('REPORTS:VIEW', 'REPORTS:' + reportNo + ':VIEW');
  }

  router.map('/reports/1', auth(1), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report1')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    loadReportPage(1, req);
  });

  router.map('/reports/2', auth(2), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report2')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    loadReportPage(2, req);
  });

  router.map('/reports/3', auth(3), function(req)
  {
    loadReportPage(3, req);
  });

  router.map('/reports/4', auth(4), function(req)
  {
    loadReportPage(4, req);
  });

  router.map('/reports/5', auth(5), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report5')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    loadReportPage(5, req);
  });

  router.map('/reports/6', auth(6), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report6')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    loadReportPage(6, req);
  });

  router.map('/reports/7', auth(7), function(req)
  {
    loadReportPage(7, req);
  });

  router.map('/reports/8', auth(8), function(req)
  {
    loadReportPage(8, req);
  });

  router.map('/reports/9', auth(9), function(req)
  {
    loadReportPage(9, req);
  });

  router.map('/reports;settings', user.auth('REPORTS:MANAGE'), function(req)
  {
    viewport.loadPage('app/reports/pages/ReportSettingsPage', function(ReportSettingsPage)
    {
      return new ReportSettingsPage({
        initialTab: req.query.tab,
        initialSubtab: req.query.subtab
      });
    });
  });

});
