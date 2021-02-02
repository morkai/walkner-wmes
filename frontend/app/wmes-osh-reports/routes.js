// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  './CountReport',
  './ObserversReport',
  './EngagementReport',
  './MetricsReport',
  './pages/CountReportPage',
  './pages/ObserversReportPage',
  './pages/EngagementReportPage',
  './pages/MetricsReportPage',
  'i18n!app/nls/reports',
  'i18n!app/nls/wmes-osh-reports'
], function(
  router,
  viewport,
  user,
  CountReport,
  ObserversReport,
  EngagementReport,
  MetricsReport,
  CountReportPage,
  ObserversReportPage,
  EngagementReportPage,
  MetricsReportPage
) {
  'use strict';

  const canView = user.auth('USER');
  const canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/reports/count/:type', canView, req =>
  {
    viewport.showPage(new CountReportPage({
      model: new CountReport({}, {
        type: req.params.type,
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports/observers', canView, req =>
  {
    viewport.showPage(new ObserversReportPage({
      model: new ObserversReport({}, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports/engagement', canView, req =>
  {
    viewport.showPage(new EngagementReportPage({
      model: new EngagementReport({}, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports/metrics', canView, req =>
  {
    viewport.showPage(new MetricsReportPage({
      model: new MetricsReport({}, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports;settings', canManage, req =>
  {
    viewport.loadPage(['app/wmes-osh-reports/pages/SettingsPage'], SettingsPage =>
    {
      return new SettingsPage({
        initialTab: req.query.tab,
        initialSubtab: req.query.subtab
      });
    });
  });
});
