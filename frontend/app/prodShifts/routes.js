// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../data/orgUnits',
  '../prodChangeRequests/util/createShowDeleteFormPage',
  './ProdShift'
], function(
  router,
  viewport,
  user,
  orgUnits,
  createShowDeleteFormPage,
  ProdShift
) {
  'use strict';

  var css = 'css!app/prodShifts/assets/main';
  var nls = 'i18n!app/nls/prodShifts';
  var canView = user.auth('PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST');

  router.map('/prodShifts', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodShifts/ProdShiftCollection', 'app/prodShifts/pages/ProdShiftListPage', css, nls],
      function(ProdShiftCollection, ProdShiftListPage)
      {
        return new ProdShiftListPage({
          collection: new ProdShiftCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/prodShifts;add', canManage, function()
  {
    viewport.loadPage(['app/prodShifts/pages/AddProdShiftFormPage', css, nls], function(AddProdShiftFormPage)
    {
      return new AddProdShiftFormPage({
        model: new ProdShift()
      });
    });
  });

  router.map('/prodShifts/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodShifts/pages/ProdShiftDetailsPage',
        'css!app/prodShiftOrders/assets/main',
        'css!app/prodDowntimes/assets/main',
        css,
        'i18n!app/nls/prodShiftOrders',
        'i18n!app/nls/prodDowntimes',
        nls
      ],
      function(ProdShiftDetailsPage)
      {
        return new ProdShiftDetailsPage({
          latest: orgUnits.getByTypeAndId('prodLine', req.params.id) !== null,
          modelId: req.params.id
        });
      }
    );
  });

  router.map('/prodShifts/:id;edit', canManage, function(req)
  {
    viewport.loadPage(['app/prodShifts/pages/EditProdShiftFormPage', css, nls], function(EditProdShiftFormPage)
    {
      return new EditProdShiftFormPage({
        model: new ProdShift({_id: req.params.id})
      });
    });
  });

  router.map('/prodShifts/:id;delete', canManage, createShowDeleteFormPage(ProdShift));
});
