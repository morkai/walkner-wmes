// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenOrderCollection',
  './KaizenOrder',
  './KaizenOrderReport',
  './pages/KaizenOrderListPage',
  './pages/KaizenOrderDetailsPage',
  './pages/KaizenOrderAddFormPage',
  './pages/KaizenOrderEditFormPage',
  './pages/KaizenOrderReportPage',
  './views/KaizenOrderThankYouView',
  'i18n!app/nls/reports',
  'i18n!app/nls/kaizenOrders'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenOrderCollection,
  KaizenOrder,
  KaizenOrderReport,
  KaizenOrderListPage,
  KaizenOrderDetailsPage,
  KaizenOrderAddFormPage,
  KaizenOrderEditFormPage,
  KaizenOrderReportPage,
  KaizenOrderThankYouView
) {
  'use strict';

  var canAccess = user.auth();

  router.map('/kaizenReport', canAccess, function(req)
  {
    viewport.showPage(new KaizenOrderReportPage({
      model: new KaizenOrderReport({
        from: +req.query.from || undefined,
        to: +req.query.to || undefined,
        interval: req.query.interval
      })
    }));
  });

  router.map('/kaizenOrders', canAccess, function(req)
  {
    viewport.showPage(new KaizenOrderListPage({
      collection: new KaizenOrderCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/kaizenOrders/:id', canAccess, function(req)
  {
    var page = new KaizenOrderDetailsPage({
      model: new KaizenOrder({_id: req.params.id})
    });

    viewport.showPage(page);

    if (req.query.thank === 'you')
    {
      page.once('afterRender', function()
      {
        page.broker.publish('router.navigate', {
          url: '/kaizenOrders/' + page.model.id,
          trigger: false,
          replace: true
        });

        viewport.showDialog(new KaizenOrderThankYouView());
      });
    }
  });

  router.map('/kaizenOrders;add', canAccess, function()
  {
    viewport.showPage(new KaizenOrderAddFormPage({
      model: new KaizenOrder()
    }));
  });

  router.map('/kaizenOrders/:id;edit', canAccess, function(req)
  {
    viewport.showPage(new KaizenOrderEditFormPage({
      model: new KaizenOrder({_id: req.params.id})
    }));
  });

  router.map('/kaizenOrders/:id;delete', canAccess, _.partial(showDeleteFormPage, KaizenOrder, _, _, {
    baseBreadcrumb: true
  }));

});
