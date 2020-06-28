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

  var css = ['css!app/paintShop/assets/main'];
  var nls = ['i18n!app/nls/paintShop', 'i18n!app/nls/wh'];
  var canView = user.auth('PAINT_SHOP:VIEW');
  var canViewLocal = user.auth('LOCAL', 'PAINT_SHOP:VIEW');
  var canManage = user.auth('PAINT_SHOP:MANAGE');

  router.map('/paintShop/:date', canViewLocal, function(req)
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
        url: '/paintShop/' + req.params.date,
        replace: true,
        trigger: false
      });
    }

    viewport.loadPage(
      ['app/paintShop/pages/PaintShopPage'].concat(css, nls),
      function(PaintShopPage)
      {
        return new PaintShopPage({
          date: req.params.date,
          selectedMrp: req.query.mrp,
          selectedPaint: req.query.paint,
          fullscreen: req.query.fullscreen !== undefined
        });
      }
    );
  });

  router.map('/paintShop/paints', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/paintShopPaints/PaintShopPaintCollection',
        'app/paintShopPaints/pages/PaintShopPaintListPage',
        nls[0]
      ],
      function(PaintShopPaintCollection, PaintShopPaintListPage)
      {
        return new PaintShopPaintListPage({
          pageClassName: 'page-max-flex',
          collection: new PaintShopPaintCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/paintShop/ignoredComponents', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/ps-ignoredComponents/PsIgnoredComponentCollection',
        'app/ps-ignoredComponents/pages/ListPage',
        nls[0]
      ],
      function(PsIgnoredComponentCollection, ListPage)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          collection: new PsIgnoredComponentCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/paintShop/load', canView, function(req)
  {
    viewport.loadPage(
      ['app/paintShop/pages/PaintShopLoadPage'].concat(css, nls),
      function(PaintShopLoadPage)
      {
        return new PaintShopLoadPage({query: req.query});
      }
    );
  });

  router.map('/paintShop;settings', canManage, function(req)
  {
    viewport.loadPage(
      ['app/paintShop/pages/PaintShopSettingsPage'].concat(css, nls),
      function(PaintShopSettingsPage)
      {
        return new PaintShopSettingsPage({
          initialTab: req.query.tab
        });
      }
    );
  });
});
