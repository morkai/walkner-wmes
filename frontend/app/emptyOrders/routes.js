define([
  '../router',
  '../viewport',
  '../user',
  './pages/EmptyOrderListPage',
  './pages/EmptyOrderPrintableListPage',
  'i18n!app/nls/emptyOrders'
], function(
  router,
  viewport,
  user,
  EmptyOrderListPage,
  EmptyOrderPrintableListPage
) {
  'use strict';

  var canView = user.auth('ORDERS:VIEW');

  router.map('/emptyOrders', canView, function(req)
  {
    viewport.showPage(new EmptyOrderListPage({rql: req.rql}));
  });

  router.map('/emptyOrders;print', canView, function(req)
  {
    viewport.showPage(new EmptyOrderPrintableListPage({rql: req.rql}));
  });
});
