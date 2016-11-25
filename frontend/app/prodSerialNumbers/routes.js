// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/pages/FilteredListPage'
], function(
  router,
  viewport,
  user,
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
          actions: [],
          collection: new ProdSerialNumberCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
