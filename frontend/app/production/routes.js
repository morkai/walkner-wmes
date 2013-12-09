define([
  '../broker',
  '../router',
  '../viewport',
  '../data/prodLines',
  './ProductionEntry',
  './pages/ProductionPage',
  'i18n!app/nls/production'
], function(
  broker,
  router,
  viewport,
  prodLines,
  ProductionEntry,
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
      productionEntry: new ProductionEntry({
        prodLine: prodLine.id
      })
    }));
  });

});
