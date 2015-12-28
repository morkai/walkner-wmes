// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

  var nls = 'i18n!app/nls/emptyOrders';
  var canView = user.auth('ORDERS:VIEW');

  router.map('/emptyOrders', canView, function(req)
  {
    viewport.loadPage(['app/emptyOrders/pages/EmptyOrderListPage', nls], function(EmptyOrderListPage)
    {
      return new EmptyOrderListPage({rql: req.rql});
    });
  });

  router.map('/emptyOrders;print', canView, function(req)
  {
    viewport.loadPage(['app/emptyOrders/pages/EmptyOrderPrintableListPage', nls], function(EmptyOrderPrintableListPage)
    {
      return new EmptyOrderPrintableListPage({rql: req.rql});
    });
  });
});
