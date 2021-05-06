// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/kaizenOrders/assets/main';
  var nls = 'i18n!app/nls/kaizenOrders';
  var canAccess = user.auth();
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');
  var canAccessLocal = user.auth('LOCAL', 'USER');

  router.map('/kaizenOrders/reports/count', canAccess, function(req)
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

  router.map('/kaizenOrders/reports/summary', canAccess, function(req)
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

  router.map('/kaizenOrders/reports/metrics', canAccess, function(req)
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
        'app/kaizenOrders/KaizenOrder',
        'app/kaizenOrders/pages/KaizenOrderDetailsPage',
        'app/kaizenOrders/views/KaizenOrderThankYouView',
        css,
        nls
      ],
      function(KaizenOrder, KaizenOrderDetailsPage, KaizenOrderThankYouView)
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
        'app/kaizenOrders/KaizenOrder',
        'app/kaizenOrders/pages/KaizenOrderAddFormPage',
        css,
        nls
      ],
      function(KaizenOrder, KaizenOrderAddFormPage)
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

        var data = {};

        try { _.assign(data, JSON.parse(sessionStorage.getItem('KO_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('KO_LAST'); }

        if (req.query.suggestion)
        {
          data.relatedSuggestion = +req.query.suggestion;

          broker.publish('router.navigate', {
            url: '/kaizenOrders;add',
            trigger: false,
            replace: true
          });
        }

        return new KaizenOrderAddFormPage({
          model: new KaizenOrder(data),
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
        'app/kaizenOrders/KaizenOrder',
        'app/kaizenOrders/pages/KaizenOrderEditFormPage',
        css,
        nls
      ],
      function(KaizenOrder, KaizenOrderEditFormPage)
      {
        var model = new KaizenOrder({_id: req.params.id});
        var data = {};

        try { _.assign(data, JSON.parse(sessionStorage.getItem('KO_LAST'))); }
        catch (err) {} // eslint-disable-line no-empty
        finally { sessionStorage.removeItem('KO_LAST'); }

        if (req.query.suggestion)
        {
          data.relatedSuggestion = +req.query.suggestion;

          broker.publish('router.navigate', {
            url: '/kaizenOrders/' + req.params.id + ';edit',
            trigger: false,
            replace: true
          });
        }

        var page = new KaizenOrderEditFormPage({
          model: model
        });

        if (data._id === req.params.id)
        {
          page.listenToOnce(model, 'sync', function()
          {
            _.assign(model.attributes, data);
          });
        }

        return page;
      }
    );
  });

  router.map(
    '/kaizenOrders/:id;delete',
    canAccess,
    _.partial(showDeleteFormPage, 'app/kaizenOrders/KaizenOrder', _, _, {
      baseBreadcrumb: true
    })
  );

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
