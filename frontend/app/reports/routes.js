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

  var canView = user.auth('REPORTS:VIEW');

  router.map('/reports/1', canView, function(req)
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

  router.map('/reports/2', canView, function(req)
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

  router.map('/reports/3', canView, function(req)
  {
    viewport.loadPage('app/reports/pages/Report3Page', function(Report3Page)
    {
      return new Report3Page({query: req.rql});
    });
  });

  router.map('/reports/4', canView, function(req)
  {
    viewport.loadPage('app/reports/pages/Report4Page', function(Report4Page)
    {
      return new Report4Page({query: req.query});
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
