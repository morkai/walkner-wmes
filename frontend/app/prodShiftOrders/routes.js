// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../prodChangeRequests/util/createShowDeleteFormPage',
  './ProdShiftOrder',
  './ProdShiftOrderCollection'
], function(
  router,
  viewport,
  user,
  createShowDeleteFormPage,
  ProdShiftOrder,
  ProdShiftOrderCollection
) {
  'use strict';

  var nls = 'i18n!app/nls/prodShiftOrders';
  var canView = user.auth('PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST');

  router.map('/prodShiftOrders', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodShiftOrders/pages/ProdShiftOrderListPage', nls],
      function(ProdShiftOrderListPage)
      {
        return new ProdShiftOrderListPage({
          collection: new ProdShiftOrderCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/prodShiftOrders/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodShiftOrders/pages/ProdShiftOrderDetailsPage',
        'i18n!app/nls/orders',
        'i18n!app/nls/mechOrders',
        nls
      ],
      function(ProdShiftOrderDetailsPage)
      {
        return new ProdShiftOrderDetailsPage({modelId: req.params.id});
      }
    );
  });

  router.map('/prodShiftOrders/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/prodShiftOrders/pages/EditProdShiftOrderFormPage', nls],
      function(EditProdShiftFormPage)
      {
        return new EditProdShiftFormPage({
          model: new ProdShiftOrder({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodShiftOrders/:id;delete', canManage, createShowDeleteFormPage(ProdShiftOrder));
});
