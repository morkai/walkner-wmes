// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenOrder'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenOrder
) {
  'use strict';

  var nls = 'i18n!app/nls/kaizenOrders';
  var canAccess = user.auth();

  router.map('/kaizenReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/KaizenOrderReport',
        'app/kaizenOrders/pages/KaizenOrderReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(KaizenOrderReport, KaizenOrderReportPage)
      {
        return new KaizenOrderReportPage({
          model: new KaizenOrderReport({
            from: +req.query.from || undefined,
            to: +req.query.to || undefined,
            interval: req.query.interval
          })
        });
      }
    );
  });

  router.map('/kaizenSummaryReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/KaizenOrderSummaryReport',
        'app/kaizenOrders/pages/KaizenOrderSummaryReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(KaizenOrderSummaryReport, KaizenOrderSummaryReportPage)
      {
        return new KaizenOrderSummaryReportPage({
          model: KaizenOrderSummaryReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/kaizenHelp', function()
  {
    viewport.loadPage(['app/core/View', 'app/kaizenOrders/templates/help', nls], function(View, helpTemplate)
    {
      return new View({
        layoutName: 'page',
        template: helpTemplate
      });
    });
  });

  router.map('/kaizenOrders', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/KaizenOrderCollection',
        'app/kaizenOrders/pages/KaizenOrderListPage',
        nls
      ],
      function(KaizenOrderCollection, KaizenOrderListPage)
      {
        return new KaizenOrderListPage({
          collection: new KaizenOrderCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/kaizenOrders/:id', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/pages/KaizenOrderDetailsPage',
        'app/kaizenOrders/views/KaizenOrderThankYouView',
        nls
      ],
      function(KaizenOrderDetailsPage, KaizenOrderThankYouView)
      {
        var page = new KaizenOrderDetailsPage({
          model: new KaizenOrder({_id: req.params.id})
        });

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

        return page;
      }
    );
  });

  router.map('/kaizenOrders;add', canAccess, function()
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/pages/KaizenOrderAddFormPage',
        nls
      ],
      function(KaizenOrderAddFormPage)
      {
        return new KaizenOrderAddFormPage({
          model: new KaizenOrder()
        });
      }
    );
  });

  router.map('/kaizenOrders/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/pages/KaizenOrderEditFormPage',
        nls
      ],
      function(KaizenOrderEditFormPage)
      {
        return new KaizenOrderEditFormPage({
          model: new KaizenOrder({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenOrders/:id;delete', canAccess, _.partial(showDeleteFormPage, KaizenOrder, _, _, {
    baseBreadcrumb: true
  }));

});
