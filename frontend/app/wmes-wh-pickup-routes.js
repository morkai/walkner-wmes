// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './broker',
  './router',
  './viewport',
  './user',
  './core/util/getShiftStartInfo',
  './wh/pages/WhPickupPage',
  'i18n!app/nls/wh',
  'i18n!app/nls/wh-lines',
  'i18n!app/nls/planning',
  'i18n!app/nls/paintShop'
], function(
  broker,
  router,
  viewport,
  user,
  getShiftStartInfo,
  WhPickupPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'WH:VIEW'), function(req)
  {
    var date = req.query.date
      || sessionStorage.WMES_WH_PICKUP_DATE
      || getShiftStartInfo(Date.now()).moment.format('YYYY-MM-DD');

    if (req.url !== '/')
    {
      broker.publish('router.navigate', {
        url: '/',
        replace: true,
        trigger: false
      });
    }

    viewport.showPage(new WhPickupPage({
      date: date,
      focus: req.query.focus
    }));
  });
});
