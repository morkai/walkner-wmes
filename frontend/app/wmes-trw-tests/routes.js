// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user'
], function(
  _,
  router,
  viewport,
  user
) {
  'use strict';

  var nls = 'i18n!app/nls/wmes-trw-tests';
  var canView = user.auth('TRW:VIEW');
  var baseBreadcrumb = true;

  router.map('/trw/tests', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/core/util/pageActions',
        'app/wmes-trw-tests/dictionaries',
        'app/wmes-trw-tests/TestCollection',
        'app/wmes-trw-tests/views/FilterView',
        'app/wmes-trw-tests/views/ListView',
        nls
      ],
      function(
        FilteredListPage,
        pageActions,
        dictionaries,
        Collection,
        FilterView,
        ListView)
      {
        return dictionaries.bind(new FilteredListPage({
          actions: function(layout)
          {
            return [pageActions.export({
              layout: layout,
              page: this,
              collection: this.collection
            })];
          },
          baseBreadcrumb: baseBreadcrumb,
          FilterView: FilterView,
          ListView: ListView,
          collection: new Collection(null, {rqlQuery: req.rql})
        }));
      }
    );
  });
});
