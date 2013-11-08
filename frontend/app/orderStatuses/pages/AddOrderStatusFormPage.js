define([
  'app/i18n',
  'app/core/View',
  '../OrderStatus',
  '../views/OrderStatusFormView',
  'i18n!app/nls/orderStatuses'
], function(
  t,
  View,
  OrderStatus,
  OrderStatusFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'addOrderStatusForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('orderStatuses', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        t.bound('orderStatuses', 'BREADCRUMBS:ADD_FORM')
      ];
    },

    initialize: function()
    {
      this.model = new OrderStatus();

      this.view = new OrderStatusFormView({
        model: this.model,
        formMethod: 'POST',
        formAction: this.model.url(),
        formActionText: t('orderStatuses', 'FORM_ACTION_ADD'),
        failureText: t('orderStatuses', 'FORM_ERROR_ADD_FAILURE'),
        panelTitleText: t('orderStatuses', 'PANEL_TITLE:addForm'),
        requirePassword: true
      });
    }

  });
});
