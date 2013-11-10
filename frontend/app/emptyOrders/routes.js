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

  router.map('/emptyOrders', user.auth('ORDERS:VIEW'), function showEmptyOrderListPage(req)
  {
    viewport.showPage(new EmptyOrderListPage({rql: req.rql}));
  });

  router.map('/emptyOrders;print', user.auth('ORDERS:VIEW'), function printEmptyOrderListPage(req)
  {
    viewport.showPage(new EmptyOrderPrintableListPage({rql: req.rql}));
  });
});
