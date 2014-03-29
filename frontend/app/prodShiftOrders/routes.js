define([
  '../router',
  '../viewport',
  '../user',
  './ProdShiftOrder',
  './pages/ProdShiftOrderListPage',
  'i18n!app/nls/prodShiftOrders'
], function(
  router,
  viewport,
  user,
  ProdShiftOrder,
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

  router.map('/prodShiftOrders/:id;edit', user.auth('PROD_DATA:MANAGE'), function(req)
  {
    viewport.loadPage(
      ['app/prodShiftOrders/pages/EditProdShiftOrderFormPage'],
      function(EditProdShiftFormPage)
      {
        return new EditProdShiftFormPage({
          model: new ProdShiftOrder({_id: req.params.id})
        });
      }
    );
  });
});
