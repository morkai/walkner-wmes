// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  router.map('/prodLogEntries', user.auth('PROD_DATA:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/prodLogEntries/ProdLogEntryCollection',
        'app/prodLogEntries/pages/ProdLogEntryListPage',
        'css!app/prodLogEntries/assets/main',
        'i18n!app/nls/prodLogEntries',
        'i18n!app/nls/prodShifts',
        'i18n!app/nls/prodShiftOrders',
        'i18n!app/nls/prodDowntimes'
      ],
      function(ProdLogEntryCollection, ProdLogEntryListPage)
      {
        return new ProdLogEntryListPage({
          collection: new ProdLogEntryCollection(null, {rqlQuery: req.rql}),
          prodShift: req.query.prodShift || null,
          prodShiftOrder: req.query.prodShiftOrder || null
        });
      }
    );
  });
});
