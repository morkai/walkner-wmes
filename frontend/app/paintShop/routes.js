// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../time',
  '../router',
  '../viewport',
  '../user',
  './pages/PaintShopPage',
  'i18n!app/nls/paintShop'
], function(
  broker,
  time,
  router,
  viewport,
  user,
  PaintShopPage
) {
  'use strict';

  router.map('/paintShop/:date', user.auth('LOCAL', 'PAINT_SHOP:VIEW'), function(req)
  {
    if (req.params.date === 'current')
    {
      req.params.date = '0d';
    }

    if (/^-?[0-9]+d$/.test(req.params.date))
    {
      req.params.date = time.getMoment()
        .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
        .startOf('day')
        .add(+req.params.date.replace('d', ''), 'days')
        .format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/paintShop/' + req.params.date,
        replace: true,
        trigger: false
      });
    }

    viewport.showPage(new PaintShopPage({
      date: req.params.date,
      selectedMrp: req.query.mrp,
      fullscreen: req.query.fullscreen !== undefined
    }));
  });
});
