// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  './pages/MechOrderListPage',
  './pages/MechOrderDetailsPage',
  'i18n!app/nls/mechOrders'
], function(
  router,
  viewport,
  user,
  MechOrderListPage,
  MechOrderDetailsPage
) {
  'use strict';

  var canView = user.auth('ORDERS:VIEW');

  router.map('/mechOrders', canView, function(req)
  {
    viewport.showPage(new MechOrderListPage({rql: req.rql}));
  });

  router.map('/mechOrders/:id', canView, function(req)
  {
    viewport.showPage(new MechOrderDetailsPage({modelId: req.params.id}));
  });
});
