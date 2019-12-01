// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  const nls = 'i18n!app/nls/wmes-ct-pces';
  const canView = user.auth('PROD_DATA:VIEW');

  router.map('/ct/pces', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-ct-pces/PceCollection',
        'app/wmes-ct-pces/views/FilterView',
        'app/wmes-ct-pces/views/ListView',
        nls
      ],
      function(FilteredListPage, PceCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#ct',
          actions: null,
          FilterView: FilterView,
          ListView: ListView,
          collection: new PceCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/ct/reports/pce', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-ct-pces/PceReport',
        'app/wmes-ct-pces/pages/PceReportPage',
        'css!app/wmes-ct-pces/assets/pceReport',
        'i18n!app/nls/reports',
        nls
      ],
      function(Report, ReportPage)
      {
        return new ReportPage({
          model: Report.fromQuery(req.query)
        });
      }
    );
  });
});
