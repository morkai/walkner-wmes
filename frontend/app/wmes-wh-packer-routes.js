// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './router',
  './viewport',
  './user',
  './wh/pages/WhDistPage',
  'i18n!app/nls/wh',
  'i18n!app/nls/planning',
  'i18n!app/nls/paintShop'
], function(
  router,
  viewport,
  user,
  WhDistPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'WH:VIEW'), function()
  {
    viewport.showPage(new WhDistPage({
      kind: 'packaging',
      fullscreen: true
    }));
  });
});
