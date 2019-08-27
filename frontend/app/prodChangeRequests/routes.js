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

  router.map('/prodChangeRequests', user.auth('PROD_DATA:CHANGES:*'), function(req)
  {
    viewport.loadPage(
      [
        'app/prodChangeRequests/ProdChangeRequestCollection',
        'app/prodChangeRequests/pages/ProdChangeRequestListPage',
        'css!app/prodShifts/assets/main',
        'css!app/prodShiftOrders/assets/main',
        'css!app/prodDowntimes/assets/main',
        'css!app/prodChangeRequests/assets/main',
        'i18n!app/nls/prodShifts',
        'i18n!app/nls/prodShiftOrders',
        'i18n!app/nls/prodDowntimes',
        'i18n!app/nls/fte',
        'i18n!app/nls/prodChangeRequests'
      ],
      function(ProdChangeRequestCollection, ProdChangeRequestListPage)
      {
        return new ProdChangeRequestListPage({
          collection: new ProdChangeRequestCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
