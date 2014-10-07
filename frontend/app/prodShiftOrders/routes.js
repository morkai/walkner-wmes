// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdShiftOrder',
  './pages/ProdShiftOrderListPage',
  'i18n!app/nls/prodShiftOrders'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  ProdShiftOrder,
  ProdShiftOrderListPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:VIEW');

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

  router.map('/prodShiftOrders/:id;edit', canManage, function(req)
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

  router.map(
    '/prodShiftOrders/:id;delete', canManage, showDeleteFormPage.bind(null, ProdShiftOrder)
  );
});
