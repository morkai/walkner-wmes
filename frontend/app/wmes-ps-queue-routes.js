// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  './time',
  './router',
  './viewport',
  './user',
  './core/util/getShiftStartInfo',
  './paintShop/pages/PaintShopPage',
  'i18n!app/nls/paintShop'
], function(
  $,
  time,
  router,
  viewport,
  user,
  getShiftStartInfo,
  PaintShopPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PAINT_SHOP:VIEW');

  router.map('/', canView, function()
  {
    var date = time.utc.getMoment(
      getShiftStartInfo(Date.now()).moment.subtract(1, 'days').format('YYYY-MM-DD'),
      'YYYY-MM-DD'
    );
    var req = $.ajax({
      url: '/paintShop/orders?select(date)&sort(date)&limit(1)&status=in=(new,started,partial)&date=ge='
        + date.valueOf(),
      timeout: 5000
    });

    req.done(function(res)
    {
      if (res.collection && res.collection.length)
      {
        date = time.utc.getMoment(res.collection[0].date);
      }
    });

    req.always(function()
    {
      viewport.showPage(new PaintShopPage({
        date: date.format('YYYY-MM-DD'),
        selectedMrp: null,
        fullscreen: true
      }));
    });
  });

  router.map('/paintShop/:date', canView, function(req)
  {
    viewport.showPage(new PaintShopPage({
      date: req.params.date,
      selectedMrp: req.query.mrp,
      fullscreen: req.query.fullscreen === '1'
    }));
  });
});
