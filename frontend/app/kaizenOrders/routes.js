// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var css = 'css!app/kaizenOrders/assets/main';
  var nls = 'i18n!app/nls/kaizenOrders';
  var canAccess = user.auth();
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');
  var canAccessLocal = user.auth('LOCAL', 'USER');

  router.map('/kaizenReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/KaizenOrderReport',
        'app/kaizenOrders/pages/KaizenOrderReportPage',
        'css!app/suggestions/assets/main',
        css,
        'i18n!app/nls/reports',
        nls
      ],
      function(KaizenOrderReport, KaizenOrderReportPage)
      {
        return new KaizenOrderReportPage({
          model: KaizenOrderReport.fromQuery(req.query)
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
        'css!app/suggestions/assets/main',
        css,
        'i18n!app/nls/reports',
        'i18n!app/nls/suggestions',
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

  router.map('/kaizenEngagementReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/suggestions/SuggestionEngagementReport',
        'app/suggestions/pages/SuggestionEngagementReportPage',
        css,
        'i18n!app/nls/reports',
        'i18n!app/nls/suggestions',
        nls
      ],
      function(SuggestionEngagementReport, SuggestionEngagementReportPage)
      {
        return new SuggestionEngagementReportPage({
          baseBreadcrumbNls: 'kaizenOrders',
          model: SuggestionEngagementReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/kaizenMetricsReport', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/KaizenMetricsReport',
        'app/kaizenOrders/pages/KaizenMetricsReportPage',
        css,
        'i18n!app/nls/reports',
        'i18n!app/nls/suggestions',
        nls
      ],
      function(KaizenMetricsReport, KaizenMetricsReportPage)
      {
        return new KaizenMetricsReportPage({
          model: KaizenMetricsReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/kaizenHelp', function()
  {
    viewport.loadPage(['app/core/View', 'app/kaizenOrders/templates/help', css, nls], function(View, helpTemplate)
    {
      return new View({
        layoutName: 'page',
        template: helpTemplate
      });
    });
  });

  router.map('/kaizenOrders', canAccessLocal, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/KaizenOrderCollection',
        'app/kaizenOrders/pages/KaizenOrderListPage',
        css,
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

  router.map('/kaizenOrders/:id', canAccessLocal, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/pages/KaizenOrderDetailsPage',
        'app/kaizenOrders/views/KaizenOrderThankYouView',
        css,
        nls
      ],
      function(KaizenOrderDetailsPage, KaizenOrderThankYouView)
      {
        var page = new KaizenOrderDetailsPage({
          model: new KaizenOrder({_id: req.params.id}),
          standalone: !!req.query.standalone
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

            viewport.showDialog(new KaizenOrderThankYouView({
              model: page.model
            }));
          });
        }

        return page;
      }
    );
  });

  router.map('/kaizenOrders;add', canAccessLocal, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/pages/KaizenOrderAddFormPage',
        css,
        nls
      ],
      function(KaizenOrderAddFormPage)
      {
        var operator = null;

        try
        {
          operator = JSON.parse(decodeURIComponent(atob(req.query.operator)));
        }
        catch (err) {} // eslint-disable-line no-empty

        var standalone = !!req.query.standalone;
        var p = 'WMES_STANDALONE_CLOSE_TIMER';

        if (standalone && typeof window[p] === 'undefined')
        {
          clearTimeout(window[p]);

          window.onblur = function()
          {
            clearTimeout(window[p]);
            window[p] = setTimeout(function() { window.close(); }, 60000);
          };
          window.onfocus = function()
          {
            clearTimeout(window[p]);
          };
        }

        return new KaizenOrderAddFormPage({
          model: new KaizenOrder(),
          standalone: standalone,
          operator: operator
        });
      }
    );
  });

  router.map('/kaizenOrders/:id;edit', canAccess, function(req)
  {
    viewport.loadPage(
      [
        'app/kaizenOrders/pages/KaizenOrderEditFormPage',
        css,
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

  router.map('/kaizenOrders;settings', canManage, function(req)
  {
    viewport.loadPage(['app/kaizenOrders/pages/KaizenSettingsPage', nls], function(KaizenSettingsPage)
    {
      return new KaizenSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
