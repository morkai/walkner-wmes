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

  var nls = 'i18n!app/nls/xiconfOrders';
  var canView = user.auth('XICONF:VIEW');

  router.map('/xiconf/orders', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfOrders/XiconfOrderCollection',
        'app/xiconfOrders/pages/XiconfOrderListPage',
        nls
      ],
      function(XiconfOrderCollection, XiconfOrderListPage)
      {
        return new XiconfOrderListPage({
          collection: new XiconfOrderCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/xiconf/orders/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfOrders/XiconfOrder',
        'app/xiconfOrders/pages/XiconfOrderDetailsPage',
        'i18n!app/nls/orders',
        nls
      ],
      function(XiconfOrder, XiconfOrderDetailsPage)
      {
        return new XiconfOrderDetailsPage({
          model: new XiconfOrder({_id: req.params.id})
        });
      }
    );
  });
});
