// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './router',
  './viewport',
  './user',
  './paintShop/pages/PaintShopLoadPage',
  'i18n!app/nls/paintShop'
], function(
  router,
  viewport,
  user,
  PaintShopLoadPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'PAINT_SHOP:VIEW'), function()
  {
    viewport.showPage(new PaintShopLoadPage());
  });
});
