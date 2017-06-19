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

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW');

  router.map('/prodLogEntries', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodLogEntries/pages/ProdLogEntryListPage',
        'i18n!app/nls/prodLogEntries',
        'i18n!app/nls/prodShifts',
        'i18n!app/nls/prodShiftOrders',
        'i18n!app/nls/prodDowntimes'
      ],
      function(ProdLogEntryListPage)
      {
        return new ProdLogEntryListPage({rql: req.rql});
      }
    );
  });
});
