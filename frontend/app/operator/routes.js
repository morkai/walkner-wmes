// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../data/orgUnits',
  '../data/localStorage',
  '../prodShifts/ProdShift',
  '../production/pages/ProductionPage',
  'i18n!app/nls/production',
  'i18n!app/nls/isa',
  'i18n!app/nls/users',
  'i18n!app/nls/prodSerialNumbers'
], function(
  router,
  viewport,
  orgUnits,
  localStorage,
  ProdShift,
  ProductionPage
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new ProductionPage({
      model: new ProdShift(orgUnits.getAllForProdLine(localStorage.getItem(ProdShift.LINE_STORAGE_KEY)), {
        production: true
      })
    }));
  });
});
