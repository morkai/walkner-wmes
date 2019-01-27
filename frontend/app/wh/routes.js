// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time',
  './pages/WhPlanPage',
  './pages/WhProblemListPage',
  'i18n!app/nls/planning',
  'i18n!app/nls/wh'
], function(
  broker,
  router,
  viewport,
  user,
  time,
  WhPlanPage,
  WhProblemListPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'WH:VIEW');
  var canManage = user.auth('WH:MANAGE');

  router.map('/wh/plans/:id', canView, function(req)
  {
    if (/^-?[0-9]+d$/.test(req.params.id))
    {
      req.params.id = time.getMoment()
        .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
        .startOf('day')
        .add(+req.params.id.replace('d', ''), 'days')
        .format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/wh/plans/' + req.params.id,
        replace: true,
        trigger: false
      });
    }

    viewport.showPage(new WhPlanPage({
      date: req.params.id,
      focus: req.query.focus
    }));
  });

  router.map('/wh/problems', canView, function()
  {
    viewport.showPage(new WhProblemListPage());
  });

  router.map('/wh/settings', canManage, function(req)
  {
    viewport.loadPage('app/wh/pages/WhSettingsPage', function(WhSettingsPage)
    {
      return new WhSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
