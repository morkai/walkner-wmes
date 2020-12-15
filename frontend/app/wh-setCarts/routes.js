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

  var canView = user.auth('WH:VIEW');

  router.map('/wh/setCarts', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wh-setCarts/WhSetCartCollection',
        'app/wh-setCarts/views/FilterView',
        'app/wh-setCarts/views/ListView',
        'i18n!app/nls/wh-setCarts'
      ],
      function(FilteredListPage, WhSetCartCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#wh/pickup/0d',
          FilterView: FilterView,
          ListView: ListView,
          collection: new WhSetCartCollection(null, {rqlQuery: req.rql}),
          actions: function(layout)
          {
            return [
              pageActions.export(layout, this, this.collection)
            ];
          }
        });
      }
    );
  });
});
