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

  var canView = user.auth('SNF:VIEW');
  var baseBreadcrumb = true;

  router.map('/snf/tests', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/FilteredListPage',
        'app/core/util/pageActions',
        'app/wmes-snf-tests/dictionaries',
        'app/wmes-snf-tests/TestCollection',
        'app/wmes-snf-tests/views/FilterView',
        'app/wmes-snf-tests/views/ListView',
        'i18n!app/nls/wmes-snf-tests',
        'i18n!app/nls/wmes-snf-programs'
      ],
      function(
        FilteredListPage,
        pageActions,
        dictionaries,
        Collection,
        FilterView,
        ListView
      ) {
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

  router.map('/snf/tests/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-snf-tests/dictionaries',
        'app/wmes-snf-tests/Test',
        'app/wmes-snf-tests/pages/DetailsPage',
        'i18n!app/nls/wmes-snf-tests',
        'i18n!app/nls/wmes-snf-programs'
      ],
      function(dictionaries, Model, DetailsPage)
      {
        return dictionaries.bind(new DetailsPage({
          model: new Model({_id: req.params.id})
        }));
      }
    );
  });
});
