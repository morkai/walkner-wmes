// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/xiconf',
  'i18n!app/nls/xiconfProgramOrders'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('XICONF:VIEW');

  router.map('/xiconf/programOrders', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfProgramOrders/XiconfProgramOrderCollection',
        'app/xiconfProgramOrders/pages/XiconfProgramOrderListPage'
      ],
      function(XiconfProgramOrderCollection, XiconfProgramOrderListPage)
      {
        return new XiconfProgramOrderListPage({
          collection: new XiconfProgramOrderCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/xiconf/programOrders/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfProgramOrders/XiconfProgramOrder',
        'app/xiconfProgramOrders/pages/XiconfProgramOrderDetailsPage'
      ],
      function(XiconfProgramOrder, XiconfProgramOrderDetailsPage)
      {
        return new XiconfProgramOrderDetailsPage({
          model: new XiconfProgramOrder({_id: req.params.id})
        });
      }
    );
  });
});
