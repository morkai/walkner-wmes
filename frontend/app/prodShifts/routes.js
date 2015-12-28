// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

  var nls = 'i18n!app/nls/prodShifts';
  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST');

  router.map('/prodShifts', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodShifts/ProdShiftCollection', 'app/prodShifts/pages/ProdShiftListPage', nls],
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
    viewport.loadPage(['app/prodShifts/pages/AddProdShiftFormPage', nls], function(AddProdShiftFormPage)
    {
      return new AddProdShiftFormPage({
        model: new ProdShift()
      });
    });
  });

  router.map('/prodShifts/:id', canView, function(req)
  {
    viewport.loadPage(['app/prodShifts/pages/ProdShiftDetailsPage', nls], function(ProdShiftDetailsPage)
    {
      return new ProdShiftDetailsPage({
        latest: orgUnits.getByTypeAndId('prodLine', req.params.id) !== null,
        modelId: req.params.id
      });
    });
  });

  router.map('/prodShifts/:id;edit', canManage, function(req)
  {
    viewport.loadPage(['app/prodShifts/pages/EditProdShiftFormPage', nls], function(EditProdShiftFormPage)
    {
      return new EditProdShiftFormPage({
        model: new ProdShift({_id: req.params.id})
      });
    });
  });

  router.map('/prodShifts/:id;delete', canManage, createShowDeleteFormPage(ProdShift));

});
