// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  './time',
  './router',
  './viewport',
  './user',
  './core/util/getShiftStartInfo',
  './wmes-drilling/pages/DrillingPage',
  'i18n!app/nls/wmes-drilling'
], function(
  $,
  time,
  router,
  viewport,
  user,
  getShiftStartInfo,
  DrillingPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'DRILLING:VIEW');

  router.map('/', canView, function()
  {
    var date = time.utc.getMoment(
      getShiftStartInfo(Date.now()).moment.subtract(1, 'days').format('YYYY-MM-DD'),
      'YYYY-MM-DD'
    );
    var req = $.ajax({
      url: '/drilling/orders?select(date)&sort(date)&limit(1)&status=in=(new,started,partial)&date=ge='
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
      viewport.showPage(new DrillingPage({
        date: date.format('YYYY-MM-DD'),
        selectedMrp: null,
        fullscreen: true
      }));
    });
  });

  router.map('/drilling/:date', canView, function(req)
  {
    viewport.showPage(new DrillingPage({
      date: req.params.date,
      selectedMrp: req.query.mrp,
      fullscreen: req.query.fullscreen === '1'
    }));
  });
});
