// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/pageActions',
  '../core/pages/FilteredListPage'
], function(
  router,
  viewport,
  user,
  pageActions,
  FilteredListPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW');

  router.map('/prodSerialNumbers', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodSerialNumbers/ProdSerialNumberCollection',
        'app/prodSerialNumbers/views/ProdSerialNumberFilterView',
        'app/prodSerialNumbers/views/ProdSerialNumberListView',
        'i18n!app/nls/prodSerialNumbers'
      ],
      function(ProdSerialNumberCollection, ProdSerialNumberFilterView, ProdSerialNumberListView)
      {
        return new FilteredListPage({
          FilterView: ProdSerialNumberFilterView,
          ListView: ProdSerialNumberListView,
          actions: function(layout)
          {
            return [pageActions.export(layout, this, this.collection)];
          },
          collection: new ProdSerialNumberCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
