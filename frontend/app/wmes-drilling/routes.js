// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../time',
  '../router',
  '../viewport',
  '../user',
  './pages/DrillingPage',
  'i18n!app/nls/wmes-drilling'
], function(
  broker,
  time,
  router,
  viewport,
  user,
  DrillingPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'DRILLING:VIEW');
  var canManage = user.auth('DRILLING:MANAGE');

  router.map('/drilling/:date', canView, function(req)
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
        url: '/drilling/' + req.params.date,
        replace: true,
        trigger: false
      });
    }

    viewport.showPage(new DrillingPage({
      date: req.params.date,
      selectedMrp: req.query.mrp,
      fullscreen: req.query.fullscreen !== undefined
    }));
  });

  router.map('/drilling;settings', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-drilling/pages/DrillingSettingsPage'
      ],
      function(DrillingSettingsPage)
      {
        return new DrillingSettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
