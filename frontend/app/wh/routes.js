// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time'
], function(
  $,
  broker,
  router,
  viewport,
  user,
  time
) {
  'use strict';

  var css = [
    'css!app/paintShop/assets/main',
    'css!app/planning/assets/main',
    'css!app/wh/assets/main'
  ];
  var nls = [
    'i18n!app/nls/wh',
    'i18n!app/nls/wh-lines',
    'i18n!app/nls/planning',
    'i18n!app/nls/paintShop'
  ];
  var canView = user.auth('LOCAL', 'WH:VIEW');
  var canManage = user.auth('WH:MANAGE', 'WH:MANAGE:USERS');

  router.map('/wh/pickup/:id', canView, function(req)
  {
    if (/^-?[0-9]+d$/.test(req.params.id))
    {
      req.params.id = time.getMoment()
        .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
        .startOf('day')
        .add(+req.params.id.replace('d', ''), 'days')
        .format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/wh/pickup/' + req.params.id,
        replace: true,
        trigger: false
      });
    }

    var options = {
      date: req.params.id,
      focus: null,
      from: req.query.from === undefined ? '06:00' : req.query.from,
      to: req.query.to === undefined ? '06:00' : req.query.to
    };

    if (req.query.order)
    {
      options.focus = {type: 'order', order: req.query.order};
    }
    else if (req.query.set)
    {
      options.focus = {type: 'set', order: req.query.set};
    }

    ['whStatuses', 'psStatuses', 'distStatuses', 'orders', 'lines', 'mrps', 'sets'].forEach(function(prop)
    {
      options[prop] = req.query[prop] === undefined
        ? null
        : req.query[prop].split(',').filter(function(v) { return v.length > 0; });
    });

    viewport.loadPage(
      ['app/wh/pages/WhPickupPage'].concat(css, nls),
      function(WhPickupPage)
      {
        return new WhPickupPage(options);
      }
    );
  });

  router.map('/wh/problems', canView, function()
  {
    viewport.loadPage(
      ['app/wh/pages/WhProblemsPage'].concat(css, nls),
      function(WhProblemsPage)
      {
        return new WhProblemsPage();
      }
    );
  });

  router.map('/wh/delivery/:kind', canView, function(req)
  {
    viewport.loadPage(
      ['app/wh/pages/WhDeliveryPage'].concat(css, nls),
      function(WhDeliveryPage)
      {
        return new WhDeliveryPage({
          kind: req.params.kind
        });
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

  router.map('/wh/pickup;jump-to-order', canView, function(req)
  {
    viewport.msg.loading();

    var orderNo = req.query.order;

    var orderReq = $.ajax({url: '/orders/' + orderNo + '?select(scheduledStartDate)'});

    orderReq.fail(function()
    {
      viewport.msg.loaded();

      broker.publish('viewport.page.loadingFailed', {
        page: null,
        xhr: orderReq
      });
    });

    orderReq.done(function(order)
    {
      viewport.msg.loaded();

      var plan = time.getMoment(order.scheduledStartDate).format('YYYY-MM-DD');

      broker.publish('router.navigate', {
        url: '/wh/pickup/' + plan + '?&orders=' + orderNo,
        trigger: true,
        replace: true
      });
    });
  });
});
