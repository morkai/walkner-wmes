// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './PaintShopOrderCollection',
  './pages/PaintShopPage',
  'i18n!app/nls/paintShop'
], function(
  router,
  viewport,
  user,
  PaintShopOrderCollection,
  PaintShopPage
) {
  'use strict';

  router.map('/paintShop/:date', user.auth('LOCAL', 'PAINT_SHOP:VIEW'), function(req)
  {
    viewport.showPage(new PaintShopPage({
      fullscreen: req.query.fullscreen !== undefined,
      model: {
        orders: PaintShopOrderCollection.forDate(req.params.date)
      }
    }));
  });
});
