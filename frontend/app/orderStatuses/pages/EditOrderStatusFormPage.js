define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../OrderStatus',
  '../views/OrderStatusFormView',
  'i18n!app/nls/orderStatuses'
], function(
  t,
  bindLoadingMessage,
  View,
  OrderStatus,
  OrderStatusFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'editOrderStatusForm',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('orderStatuses', 'BREADCRUMBS:BROWSE'),
          href: this.model.genClientUrl('base')
        },
        {
          label: this.model.getLabel(),
          href: this.model.genClientUrl()
        },
        t.bound('orderStatuses', 'BREADCRUMBS:EDIT_FORM')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new OrderStatus({_id: this.options.orderStatusId}), this);

      this.view = new OrderStatusFormView({
        editMode: true,
        model: this.model,
        formMethod: 'PUT',
        formAction: this.model.url(),
        formActionText: t('orderStatuses', 'FORM_ACTION_EDIT'),
        failureText: t('orderStatuses', 'FORM_ERROR_EDIT_FAILURE'),
        panelTitleText: t('orderStatuses', 'PANEL_TITLE:editForm'),
        requirePassword: false
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
