define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/data/orderStatuses',
  './pages/OrderStatusListPage',
  './pages/OrderStatusDetailsPage',
  './pages/AddOrderStatusFormPage',
  './pages/EditOrderStatusFormPage',
  './pages/OrderStatusActionFormPage',
  'i18n!app/nls/orderStatuses'
], function(
  router,
  viewport,
  user,
  orderStatuses,
  OrderStatusListPage,
  OrderStatusDetailsPage,
  AddOrderStatusFormPage,
  EditOrderStatusFormPage,
  OrderStatusActionFormPage
) {
  'use strict';

  var canView = user.auth('ORDER_STATUSES:VIEW');
  var canManage = user.auth('ORDER_STATUSES:MANAGE');

  router.map('/orderStatuses', canView, function showOrderStatusListPage(req)
  {
    viewport.showPage(new OrderStatusListPage({rql: req.rql, orderStatuses: orderStatuses}));
  });

  router.map('/orderStatuses/:id', function showOrderStatusDetailsPage(req)
  {
    viewport.showPage(new OrderStatusDetailsPage({orderStatusId: req.params.id}));
  });

  router.map('/orderStatuses;add', canManage, function showAddOrderStatusFormPage()
  {
    viewport.showPage(new AddOrderStatusFormPage());
  });

  router.map('/orderStatuses/:id;edit', canManage, function showEditOrderStatusFormPage(req)
  {
    viewport.showPage(new EditOrderStatusFormPage({orderStatusId: req.params.id}));
  });

  router.map(
    '/orderStatuses/:id;delete', canManage, function showDeleteOrderStatusFormPage(req, referer)
    {
      viewport.showPage(new OrderStatusActionFormPage({
        orderStatusId: req.params.id,
        actionKey: 'delete',
        successUrl: '#orderStatuses',
        cancelUrl: '#' + (referer || '/orderStatuses').substr(1),
        formMethod: 'DELETE',
        formAction: '/orderStatuses/' + req.params.id,
        formActionSeverity: 'danger'
      }));
    }
  );

});
