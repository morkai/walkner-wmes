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

  var canView = user.auth('WH:VIEW');

  router.map('/wh/downtimes', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wh-downtimes/WhDowntimeCollection',
        'app/wh-downtimes/views/FilterView',
        'app/wh-downtimes/views/ListView',
        'i18n!app/nls/wh-downtimes'
      ],
      function(FilteredListPage, WhDowntimeCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#wh/pickup/0d',
          FilterView: FilterView,
          ListView: ListView,
          collection: new WhDowntimeCollection(null, {rqlQuery: req.rql}),
          actions: []
        });
      }
    );
  });
});
