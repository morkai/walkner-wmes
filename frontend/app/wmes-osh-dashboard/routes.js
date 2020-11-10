// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/broker',
  'app/user',
  'app/router',
  'app/viewport',
  './pages/DashboardPage',
  'i18n!app/nls/wmes-osh-dashboard',
  'i18n!app/nls/wmes-osh-nearMisses',
  'i18n!app/nls/wmes-osh-kaizens'
], function(
  _,
  broker,
  user,
  router,
  viewport,
  DashboardPage
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new DashboardPage());
  });
});
