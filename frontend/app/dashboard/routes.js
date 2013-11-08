define([
  'app/router',
  'app/viewport',
  './pages/DashboardPage',
  'i18n!app/nls/dashboard'
], function(
  router,
  viewport,
  DashboardPage
) {
  'use strict';

  router.map('/', function showDashboardPage()
  {
    viewport.showPage(new DashboardPage());
  });
});
