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

  router.map('/ct/pces', user.auth('CT:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wmes-ct-pces/PceCollection',
        'app/wmes-ct-pces/views/FilterView',
        'app/wmes-ct-pces/views/ListView',
        'i18n!app/nls/wmes-ct-pces'
      ],
      function(FilteredListPage, PceCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#ct',
          FilterView: FilterView,
          ListView: ListView,
          collection: new PceCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
