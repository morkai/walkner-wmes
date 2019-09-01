// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../time',
  '../router',
  '../viewport',
  '../user'
], function(
  broker,
  time,
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('LOCAL', 'WIRING:VIEW');
  var canManage = user.auth('WIRING:MANAGE');

  router.map('/wiring/:date', canView, function(req)
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
        url: '/wiring/' + req.params.date,
        replace: true,
        trigger: false
      });
    }

    viewport.loadPage(
      [
        'app/wmes-wiring/pages/WiringPage',
        'css!app/wmes-wiring/assets/main',
        'i18n!app/nls/wmes-wiring'
      ],
      function(WiringPage)
      {
        return new WiringPage({
          date: req.params.date,
          mrp: req.query.mrp || 'all',
          status: req.query.status ? req.query.status.split(',') : [],
          fullscreen: req.query.fullscreen !== undefined
        });
      }
    );
  });

  router.map('/wiring;settings', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-wiring/pages/WiringSettingsPage',
        'i18n!app/nls/wmes-wiring'
      ],
      function(WiringSettingsPage)
      {
        return new WiringSettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
