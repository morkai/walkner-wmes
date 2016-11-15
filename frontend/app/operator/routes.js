// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../data/orgUnits',
  '../prodShifts/ProdShift',
  '../production/pages/ProductionPage',
  'i18n!app/nls/production',
  'i18n!app/nls/isa',
  'i18n!app/nls/users'
], function(
  router,
  viewport,
  orgUnits,
  ProdShift,
  ProductionPage
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new ProductionPage({
      model: new ProdShift(orgUnits.getAllForProdLine(localStorage[ProdShift.LINE_STORAGE_KEY]), {
        production: true
      })
    }));
  });
});
