// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/orderStatuses',
  './OrderStatus'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  orderStatuses,
  OrderStatus
) {
  'use strict';

  var nls = 'i18n!app/nls/orderStatuses';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/orderStatuses', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/orderStatuses/views/OrderStatusListView', nls],
      function(ListPage, OrderStatusListView)
      {
        return new ListPage({
          ListView: OrderStatusListView,
          collection: orderStatuses
        });
      }
    );
  });

  router.map('/orderStatuses/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/orderStatuses/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new OrderStatus({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/orderStatuses;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/orderStatuses/views/OrderStatusFormView', nls],
      function(AddFormPage, OrderStatusFormView)
      {
        return new AddFormPage({
          FormView: OrderStatusFormView,
          model: new OrderStatus()
        });
      }
    );
  });

  router.map('/orderStatuses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/orderStatuses/views/OrderStatusFormView', nls],
      function(EditFormPage, OrderStatusFormView)
      {
        return new EditFormPage({
          FormView: OrderStatusFormView,
          model: new OrderStatus({_id: req.params.id})
        });
      }
    );
  });

  router.map('/orderStatuses/:id;delete', canManage, showDeleteFormPage.bind(null, OrderStatus));
});
