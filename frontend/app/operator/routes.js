// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
    var prodLine = localStorage.getItem(ProdShift.LINE_STORAGE_KEY);
    var attrs = orgUnits.getAllForProdLine(prodLine);

    attrs.station = +localStorage.getItem(ProdShift.STATION_STORAGE_KEY) || 0;

    viewport.showPage(new ProductionPage({
      model: new ProdShift(attrs, {
        production: true
      })
    }));
  });
});
