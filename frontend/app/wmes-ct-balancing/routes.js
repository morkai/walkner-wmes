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

  const canView = user.auth('PROD_DATA:VIEW');

  router.map('/ct/balancing/pces', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-ct-balancing/BalancingPceCollection',
        'app/wmes-ct-balancing/views/FilterView',
        'app/wmes-ct-balancing/views/ListView',
        'i18n!app/nls/wmes-ct-balancing'
      ],
      function(FilteredListPage, Collection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#ct',
          actions: function(layout)
          {
            return [pageActions.export(layout, this, this.collection)];
          },
          FilterView: FilterView,
          ListView: ListView,
          collection: new Collection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
