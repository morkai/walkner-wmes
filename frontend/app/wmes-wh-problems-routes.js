// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './time',
  './router',
  './viewport',
  './user',
  './core/util/getShiftStartInfo',
  './wh/pages/WhProblemListPage',
  'i18n!app/nls/wh',
  'i18n!app/nls/planning',
  'i18n!app/nls/paintShop'
], function(
  time,
  router,
  viewport,
  user,
  getShiftStartInfo,
  WhProblemListPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'WH:VIEW'), function(req)
  {
    viewport.showPage(new WhProblemListPage({
      returnDate: req.query.returnDate
    }));
  });
});
