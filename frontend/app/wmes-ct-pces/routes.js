// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/util/pageActions'
], function(
  router,
  viewport,
  user,
  pageActions
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
          actions: function(layout)
          {
            return [pageActions.export(layout, this, this.collection)];
          },
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

  router.map('/ct/reports/groups', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-ct-pces/GroupsReport',
        'app/wmes-ct-pces/pages/GroupsReportPage',
        'css!app/wmes-ct-pces/assets/groupsReport',
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

  router.map('/ct/reports/results', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-ct-pces/ResultsReport',
        'app/wmes-ct-pces/pages/ResultsReportPage',
        'css!app/wmes-ct-pces/assets/resultsReport',
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
