// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time'
], function(
  broker,
  router,
  viewport,
  user,
  time
) {
  'use strict';

  var css = ['css!app/wh/assets/main', 'css!app/planning/assets/main', 'css!app/paintShop/assets/main'];
  var nls = ['i18n!app/nls/wh', 'i18n!app/nls/planning'];
  var canView = user.auth('LOCAL', 'WH:VIEW');
  var canManage = user.auth('WH:MANAGE', 'WH:MANAGE:USERS');

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

    var options = {
      date: req.params.id,
      focus: req.query.focus,
      from: req.query.from === undefined ? '06:00' : req.query.from,
      to: req.query.to === undefined ? '06:00' : req.query.to
    };

    ['whStatuses', 'psStatuses'].forEach(function(prop)
    {
      options[prop] = req.query[prop] === undefined
        ? null
        : req.query[prop].split(',').filter(function(v) { return v.length > 0; });
    });

    viewport.loadPage(
      ['app/wh/pages/WhPlanPage'].concat(css, nls),
      function(WhPlanPage)
      {
        return new WhPlanPage(options);
      }
    );
  });

  router.map('/wh/problems', canView, function()
  {
    viewport.loadPage(
      ['app/wh/pages/WhProblemListPage'].concat(css, nls),
      function(WhProblemListPage)
      {
        return new WhProblemListPage();
      }
    );
  });

  router.map('/wh/settings', canManage, function(req)
  {
    viewport.loadPage(
      ['app/wh/pages/WhSettingsPage'].concat(nls),
      function(WhSettingsPage)
      {
        return new WhSettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
