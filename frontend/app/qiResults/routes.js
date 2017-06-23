// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../time',
  '../core/util/showDeleteFormPage'
], function(
  _,
  broker,
  router,
  viewport,
  user,
  time,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/qiResults';
  var canView = user.auth('QI:RESULTS:VIEW', 'FN:master', 'FN:leader', 'FN:manager');
  var canManage = user.auth('QI:INSPECTOR', 'QI:RESULTS:MANAGE');
  var canEdit = user.auth('QI:INSPECTOR', 'QI:SPECIALIST', 'QI:RESULTS:MANAGE');

  router.map('/qi/reports/count', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiCountReport',
        'app/qiResults/pages/QiCountReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(QiCountReport, QiCountReportPage)
      {
        return new QiCountReportPage({
          model: QiCountReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/qi/reports/okRatio', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiOkRatioReport',
        'app/qiResults/pages/QiOkRatioReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(QiOkRatioReport, QiOkRatioReportPage)
      {
        return new QiOkRatioReportPage({
          model: QiOkRatioReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/qi/reports/nokRatio', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiNokRatioReport',
        'app/qiResults/pages/QiNokRatioReportPage',
        'i18n!app/nls/reports',
        nls
      ],
      function(QiNokRatioReport, QiNokRatioReportPage)
      {
        return new QiNokRatioReportPage({
          model: QiNokRatioReport.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/qi/results', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiResultCollection',
        'app/qiResults/pages/QiResultListPage',
        nls
      ],
      function(QiResultCollection, QiResultListPage)
      {
        return new QiResultListPage({
          collection: new QiResultCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/qi/results;ok', canView, function()
  {
    broker.publish('router.navigate', {
      url: '/qi/results?sort(-inspectedAt,-rid)&limit(20)&ok=true',
      trigger: true,
      replace: true
    });
  });

  router.map('/qi/results;nok', canView, function()
  {
    broker.publish('router.navigate', {
      url: '/qi/results?sort(-inspectedAt,-rid)&limit(20)&ok=false',
      trigger: true,
      replace: true
    });
  });

  router.map('/qi/results/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiResult',
        'app/qiResults/pages/QiResultDetailsPage',
        nls
      ],
      function(QiResult, QiResultDetailsPage)
      {
        return new QiResultDetailsPage({
          model: new QiResult({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/results;add', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiResult',
        'app/qiResults/pages/QiResultAddFormPage',
        nls
      ],
      function(QiResult, QiResultAddFormPage)
      {
        return new QiResultAddFormPage({
          model: new QiResult({
            ok: req.queryString === 'ok',
            inspector: {
              id: user.data._id,
              label: user.getLabel()
            },
            inspectedAt: time.format(new Date(), 'YYYY-MM-DD'),
            qtyInspected: 1,
            qtyToFix: 0,
            qtyNok: 0,
            qtyNokInspected: 0
          })
        });
      }
    );
  });

  router.map('/qi/results/:id;edit', canEdit, function(req)
  {
    viewport.loadPage(
      [
        'app/qiResults/QiResult',
        'app/qiResults/pages/QiResultEditFormPage',
        nls
      ],
      function(QiResult, QiResultEditFormPage)
      {
        return new QiResultEditFormPage({
          model: new QiResult({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/results/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/qiResults/QiResult', _, _, {
    baseBreadcrumb: true
  }));

  router.map('/qi/settings', user.auth('QI:DICTIONARIES:MANAGE'), function(req)
  {
    viewport.loadPage(['app/qiResults/pages/QiSettingsPage', nls], function(QiSettingsPage)
    {
      return new QiSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
