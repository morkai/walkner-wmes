// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../data/orgUnits',
  './ProdShift',
  './pages/ProdShiftListPage',
  'i18n!app/nls/prodShifts'
], function(
  router,
  viewport,
  user,
  orgUnits,
  ProdShift,
  ProdShiftListPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE');

  router.map('/prodShifts', canView, function(req)
  {
    viewport.showPage(new ProdShiftListPage({rql: req.rql}));
  });

  router.map('/prodShifts;add', canManage, function()
  {
    viewport.loadPage(['app/prodShifts/pages/AddProdShiftFormPage'], function(AddProdShiftFormPage)
    {
      return new AddProdShiftFormPage({
        model: new ProdShift()
      });
    });
  });

  router.map('/prodShifts/:id', canView, function(req)
  {
    viewport.loadPage('app/prodShifts/pages/ProdShiftDetailsPage', function(ProdShiftDetailsPage)
    {
      return new ProdShiftDetailsPage({
        latest: orgUnits.getByTypeAndId('prodLine', req.params.id) !== null,
        modelId: req.params.id
      });
    });
  });

  router.map('/prodShifts/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/prodShifts/pages/EditProdShiftFormPage'],
      function(EditProdShiftFormPage)
      {
        return new EditProdShiftFormPage({
          model: new ProdShift({_id: req.params.id})
        });
      }
    );
  });
});
