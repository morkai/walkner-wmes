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

  var css = 'css!app/emptyOrders/assets/main';
  var nls = 'i18n!app/nls/emptyOrders';
  var canView = user.auth('ORDERS:VIEW');

  router.map('/emptyOrders', canView, function(req)
  {
    viewport.loadPage(['app/emptyOrders/pages/EmptyOrderListPage', css, nls], function(EmptyOrderListPage)
    {
      return new EmptyOrderListPage({rql: req.rql});
    });
  });

  router.map('/emptyOrders;print', canView, function(req)
  {
    viewport.loadPage(
      ['app/emptyOrders/pages/EmptyOrderPrintableListPage', css, nls],
      function(EmptyOrderPrintableListPage)
      {
        return new EmptyOrderPrintableListPage({rql: req.rql});
      }
    );
  });
});
