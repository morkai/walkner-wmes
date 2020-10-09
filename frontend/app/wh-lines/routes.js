// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../router',
  '../viewport',
  '../user'
], function(
  t,
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('WH:VIEW', 'PLANNING:VIEW');

  router.map('/wh/lines', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wh-lines/WhLineCollection',
        'app/wh-lines/views/FilterView',
        'app/wh-lines/views/ListView',
        'css!app/wh-lines/assets/main',
        'i18n!app/nls/wh-lines'
      ],
      function(FilteredListPage, WhLineCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#wh/pickup/0d',
          pageClassName: 'page-max-flex',
          FilterView: FilterView,
          ListView: ListView,
          collection: WhLineCollection.fromQuery(req.query),
          actions: [{
            icon: 'calendar',
            href: '#wh/lineSnapshots',
            label: t('wh-lines', 'snapshots:pageAction')
          }]
        });
      }
    );
  });

  router.map('/wh/lineSnapshots', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wh-lines/WhLineSnapshotCollection',
        'app/wh-lines/views/SnapshotFilterView',
        'app/wh-lines/views/SnapshotListView',
        'css!app/wh-lines/assets/main',
        'i18n!app/nls/wh-lines'
      ],
      function(FilteredListPage, Collection, FilterView, ListView)
      {
        return new FilteredListPage({
          breadcrumbs: function()
          {
            return [
              {href: '#wh/pickup/0d', label: this.t('BREADCRUMB:base')},
              {href: '#wh/lines', label: this.t('BREADCRUMB:browse')},
              this.t('BREADCRUMB:snapshots')
            ];
          },
          pageClassName: 'page-max-flex',
          FilterView: FilterView,
          ListView: ListView,
          collection: new Collection(null, {rqlQuery: req.rql}),
          actions: []
        });
      }
    );
  });
});
