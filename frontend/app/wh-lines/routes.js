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
          actions: []
        });
      }
    );
  });
});
