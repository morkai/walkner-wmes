// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  './CountReport',
  './ObserversReport',
  './EngagementReport',
  './pages/CountReportPage',
  './pages/ObserversReportPage',
  './pages/EngagementReportPage',
  'i18n!app/nls/reports',
  'i18n!app/nls/wmes-osh-reports'
], function(
  router,
  viewport,
  user,
  CountReport,
  ObserversReport,
  EngagementReport,
  CountReportPage,
  ObserversReportPage,
  EngagementReportPage
) {
  'use strict';

  router.map('/osh/reports/count/:type', req =>
  {
    viewport.showPage(new CountReportPage({
      model: new CountReport({}, {
        type: req.params.type,
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports/observers', req =>
  {
    viewport.showPage(new ObserversReportPage({
      model: new ObserversReport({}, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports/engagement', req =>
  {
    viewport.showPage(new EngagementReportPage({
      model: new EngagementReport({}, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/osh/reports;settings', user.auth('OSH:DICTIONARIES:MANAGE'), req =>
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