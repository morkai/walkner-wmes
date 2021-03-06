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

  router.map('/wh/events', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/wh-events/WhEventCollection',
        'app/wh-events/views/FilterView',
        'app/wh-events/views/ListView',
        'i18n!app/nls/wh-events',
        'css!app/wh-events/assets/main.css'
      ],
      function(FilteredListPage, WhEventCollection, FilterView, ListView)
      {
        return new FilteredListPage({
          baseBreadcrumb: '#wh/pickup/0d',
          FilterView: FilterView,
          ListView: ListView,
          collection: new WhEventCollection(null, {rqlQuery: req.rql}),
          actions: function(layout)
          {
            return [pageActions.export(layout, this, this.collection, false)];
          }
        });
      }
    );
  });
});
