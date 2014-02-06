define([
  '../router',
  '../viewport',
  '../user',
  './pages/ProdShiftOrderListPage',
  'i18n!app/nls/prodShiftOrders'
], function(
  router,
  viewport,
  user,
  ProdShiftOrderListPage
) {
  'use strict';

  var canView = user.auth('PROD_DATA:VIEW');

  router.map('/prodShiftOrders', canView, function(req)
  {
    viewport.showPage(new ProdShiftOrderListPage({rql: req.rql}));
  });

  router.map('/prodShiftOrders/:id', canView, function(req)
  {
    viewport.loadPage(
      'app/prodShiftOrders/pages/ProdShiftOrderDetailsPage',
      function(ProdShiftOrderDetailsPage)
      {
        return new ProdShiftOrderDetailsPage({modelId: req.params.id});
      }
    );
  });
});
