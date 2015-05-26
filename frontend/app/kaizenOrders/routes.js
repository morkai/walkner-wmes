// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenOrderCollection',
  './KaizenOrder',
  './pages/KaizenOrderListPage',
  './pages/KaizenOrderDetailsPage',
  './pages/KaizenOrderAddFormPage',
  './pages/KaizenOrderEditFormPage',
  'i18n!app/nls/kaizenOrders'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenOrderCollection,
  KaizenOrder,
  KaizenOrderListPage,
  KaizenOrderDetailsPage,
  KaizenOrderAddFormPage,
  KaizenOrderEditFormPage
) {
  'use strict';

  var canAccess = user.auth();

  router.map('/kaizen/orders', canAccess, function(req)
  {
    viewport.showPage(new KaizenOrderListPage({
      collection: new KaizenOrderCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/kaizen/orders/:id', canAccess, function(req)
  {
    viewport.showPage(new KaizenOrderDetailsPage({
      model: new KaizenOrder({_id: req.params.id})
    }));
  });

  router.map('/kaizen/orders;add', canAccess, function()
  {
    viewport.showPage(new KaizenOrderAddFormPage({
      model: new KaizenOrder()
    }));
  });

  router.map('/kaizen/orders/:id;edit', canAccess, function(req)
  {
    viewport.showPage(new KaizenOrderEditFormPage({
      model: new KaizenOrder({_id: req.params.id})
    }));
  });

  router.map('/kaizen/orders/:id;delete', canAccess, _.partial(showDeleteFormPage, KaizenOrder, _, _, {
    baseBreadcrumb: true
  }));

});
