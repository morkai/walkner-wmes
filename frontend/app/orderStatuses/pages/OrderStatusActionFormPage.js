define([
  'underscore',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  'app/core/views/ActionFormView',
  '../OrderStatus',
  'i18n!app/nls/orderStatuses'
], function(
  _,
  t,
  bindLoadingMessage,
  View,
  ActionFormView,
  OrderStatus
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'orderStatusActionForm',

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
        t.bound('orderStatuses', 'BREADCRUMBS:ACTION_FORM:' + this.options.actionKey)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new OrderStatus({_id: this.options.orderStatusId}), this);

      var actionKey = this.options.actionKey;

      this.view = new ActionFormView(_.defaults({model: this.model}, this.options, {
        formActionText: t.bound('orderStatuses', 'ACTION_FORM_BUTTON:' + actionKey),
        messageText: t.bound('orderStatuses', 'ACTION_FORM_MESSAGE:' + actionKey),
        failureText: t.bound('orderStatuses', 'ACTION_FORM_MESSAGE_FAILURE:' + actionKey),
        requestData: {action: actionKey}
      }));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
