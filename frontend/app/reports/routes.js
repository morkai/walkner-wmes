// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../router',
  '../viewport'
], function(
  user,
  router,
  viewport
) {
  'use strict';

  function loadReportPage(reportNo, req, additionalDependencies)
  {
    var dependencies = [
      'app/reports/pages/Report' + reportNo + 'Page',
      'i18n!app/nls/reports'
    ];

    if (additionalDependencies)
    {
      dependencies = dependencies.concat(additionalDependencies);
    }

    viewport.loadPage(dependencies, function(ReportPage)
    {
      return new ReportPage({
        query: req.query,
        queryString: req.queryString,
        rql: req.rql,
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

  router.map('/reports/clip', auth('CLIP'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'clipReport')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    loadReportPage('Clip', req, ['i18n!app/nls/orders']);
  });

  router.map('/reports/3', auth(3), function(req)
  {
    loadReportPage(3, req);
  });

  router.map('/reports/4', auth(4), function(req)
  {
    loadReportPage(4, req, ['i18n!app/nls/pressWorksheets']);
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
    loadReportPage(7, req, ['css!app/prodDowntimes/assets/main', 'i18n!app/nls/prodDowntimes']);
  });

  router.map('/reports/8', auth(8), function(req)
  {
    loadReportPage(8, req);
  });

  router.map('/reports/9', auth(9), function(req)
  {
    loadReportPage(9, req);
  });

  router.map('/reports/rearm', auth('REARM'), function(req)
  {
    viewport.loadPage(
      [
        'app/reports/RearmReport',
        'app/reports/pages/RearmReportPage',
        'css!app/reports/assets/rearm',
        'i18n!app/nls/reports'
      ],
      function(Report, ReportPage)
      {
        return new ReportPage({
          model: Report.fromQuery(req.query),
          autoLoad: req.queryString !== ''
        });
      }
    );
  });

  router.map('/reports;settings', user.auth('REPORTS:MANAGE'), function(req)
  {
    viewport.loadPage(['app/reports/pages/ReportSettingsPage', 'i18n!app/nls/reports'], function(ReportSettingsPage)
    {
      return new ReportSettingsPage({
        initialTab: req.query.tab,
        initialSubtab: req.query.subtab
      });
    });
  });
});
