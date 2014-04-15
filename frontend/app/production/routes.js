// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../broker',
  '../router',
  '../viewport',
  '../data/prodLines',
  '../data/orgUnits',
  '../prodShifts/ProdShift',
  './pages/ProductionPage',
  'i18n!app/nls/production'
], function(
  broker,
  router,
  viewport,
  prodLines,
  orgUnits,
  ProdShift,
  ProductionPage
) {
  'use strict';

  router.map('/production/*prodLineId', function(req)
  {
    var prodLine = prodLines.get(req.params.prodLineId);

    if (prodLine == null)
    {
      return broker.publish('router.404', req);
    }

    viewport.showPage(new ProductionPage({
      model: new ProdShift(orgUnits.getAllForProdLine(prodLine), {
        production: true
      })
    }));
  });

});
