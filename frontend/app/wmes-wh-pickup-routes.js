// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './time',
  './router',
  './viewport',
  './user',
  './core/util/getShiftStartInfo',
  './wh/pages/WhPlanPage',
  'i18n!app/nls/wh',
  'i18n!app/nls/planning',
  'i18n!app/nls/paintShop'
], function(
  time,
  router,
  viewport,
  user,
  getShiftStartInfo,
  WhPlanPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'WH:VIEW'), function()
  {
    var date = sessionStorage.WMES_WH_PICKUP_DATE
      || getShiftStartInfo(Date.now()).moment.format('YYYY-MM-DD');

    viewport.showPage(new WhPlanPage({
      date: date
    }));
  });
});
