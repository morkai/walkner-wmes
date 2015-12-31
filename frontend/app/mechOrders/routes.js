// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  var nls = 'i18n!app/nls/mechOrders';
  var canView = user.auth('ORDERS:VIEW');

  router.map('/mechOrders', canView, function(req)
  {
    viewport.loadPage(['app/mechOrders/pages/MechOrderListPage', nls], function(MechOrderListPage)
    {
      return new MechOrderListPage({rql: req.rql});
    });
  });

  router.map('/mechOrders/:id', canView, function(req)
  {
    viewport.loadPage(['app/mechOrders/pages/MechOrderDetailsPage', nls], function(MechOrderDetailsPage)
    {
      return new MechOrderDetailsPage({modelId: req.params.id});
    });
  });
});
