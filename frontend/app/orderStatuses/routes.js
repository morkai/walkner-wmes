define([
  '../router',
  '../viewport',
  '../user',
  '../data/orderStatuses',
  './OrderStatus',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './views/OrderStatusListView',
  './views/OrderStatusFormView',
  'app/orderStatuses/templates/details',
  'i18n!app/nls/orderStatuses'
], function(
  router,
  viewport,
  user,
  orderStatuses,
  OrderStatus,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  OrderStatusListView,
  OrderStatusFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/orderStatuses', canView, function()
  {
    viewport.showPage(new ListPage({
      ListView: OrderStatusListView,
      collection: orderStatuses
    }));
  });

  router.map('/orderStatuses/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new OrderStatus({_id: req.params.id}),
      detailsTemplate: detailsTemplate
    }));
  });

  router.map('/orderStatuses;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: OrderStatusFormView,
      model: new OrderStatus()
    }));
  });

  router.map('/orderStatuses/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: OrderStatusFormView,
      model: new OrderStatus({_id: req.params.id})
    }));
  });

  router.map('/orderStatuses/:id;delete', canManage, function(req, referer)
  {
    var model = new OrderStatus({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });

});
