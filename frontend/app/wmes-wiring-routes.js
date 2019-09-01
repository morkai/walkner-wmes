// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  './time',
  './router',
  './viewport',
  './user',
  './core/util/getShiftStartInfo',
  './wmes-wiring/pages/WiringPage',
  'i18n!app/nls/wmes-wiring'
], function(
  $,
  time,
  router,
  viewport,
  user,
  getShiftStartInfo,
  WiringPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'WIRING:VIEW');

  router.map('/', canView, function()
  {
    var date = time.utc.getMoment(
      getShiftStartInfo(Date.now()).moment.subtract(1, 'days').format('YYYY-MM-DD'),
      'YYYY-MM-DD'
    );
    var req = $.ajax({
      url: '/wiring/orders?select(date)&sort(date)&limit(1)&status=in=(new,started,partial)&date=ge='
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
      viewport.showPage(new WiringPage({
        date: date.format('YYYY-MM-DD'),
        selectedMrp: null,
        fullscreen: true
      }));
    });
  });

  router.map('/wiring/:date', canView, function(req)
  {
    viewport.showPage(new WiringPage({
      date: req.params.date,
      selectedMrp: req.query.mrp,
      fullscreen: req.query.fullscreen === '1'
    }));
  });
});
