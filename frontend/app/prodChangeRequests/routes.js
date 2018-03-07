// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './ProdChangeRequestCollection'
], function(
  router,
  viewport,
  user,
  ProdChangeRequestCollection
) {
  'use strict';

  var canView = user.auth('PROD_DATA_CHANGES:*');

  router.map('/prodChangeRequests', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodChangeRequests/pages/ProdChangeRequestListPage',
        'i18n!app/nls/prodShifts',
        'i18n!app/nls/prodShiftOrders',
        'i18n!app/nls/prodDowntimes',
        'i18n!app/nls/fte',
        'i18n!app/nls/prodChangeRequests'
      ],
      function(ProdChangeRequestListPage)
      {
        return new ProdChangeRequestListPage({
          collection: new ProdChangeRequestCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
