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

  router.map('/reports/1', user.auth('REPORTS:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report1')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report1Page', function(Report1Page)
    {
      return new Report1Page({query: req.query});
    });
  });

  router.map('/reports/2', user.auth('REPORTS:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report2')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report2Page', function(Report2Page)
    {
      return new Report2Page({query: req.query});
    });
  });

  router.map('/reports;metricRefs', user.auth('REPORTS:MANAGE'), function(req)
  {
    viewport.loadPage('app/reports/pages/MetricRefsPage', function(MetricRefsPage)
    {
      return new MetricRefsPage({
        initialTab: req.query.tab || 'efficiency'
      });
    });
  });

});
