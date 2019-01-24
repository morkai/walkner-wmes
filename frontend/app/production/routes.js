// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  '../user',
  '../data/orgUnits'
], function(
  broker,
  router,
  viewport,
  user,
  orgUnits
) {
  'use strict';

  router.map('/production/*prodLineId', function(req)
  {
    var prodLine = orgUnits.getByTypeAndId('prodLine', req.params.prodLineId);

    if (prodLine === null)
    {
      return broker.publish('router.404', {req: req});
    }

    viewport.loadPage(
      [
        'app/prodShifts/ProdShift',
        'app/production/pages/ProductionPage',
        'i18n!app/nls/production',
        'i18n!app/nls/isa',
        'i18n!app/nls/prodSerialNumbers'
      ],
      function(ProdShift, ProductionPage)
      {
        return new ProductionPage({
          model: new ProdShift(orgUnits.getAllForProdLine(prodLine), {
            production: true
          })
        });
      }
    );
  });

  router.map('/production;settings', user.auth('PROD_DATA:MANAGE', 'PROD_DATA:MANAGE:SPIGOT_ONLY'), function(req)
  {
    viewport.loadPage(['app/production/pages/ProductionSettingsPage'], function(ProductionSettingsPage)
    {
      return new ProductionSettingsPage({
        initialTab: req.query.tab,
        initialSubtab: req.query.subtab
      });
    });
  });
});
