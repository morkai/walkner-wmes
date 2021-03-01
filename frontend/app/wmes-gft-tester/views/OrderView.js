// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/viewport',
  'app/core/View',
  './OrderPickerDialogView',
  'app/wmes-gft-tester/templates/order'
], function(
  currentUser,
  viewport,
  View,
  OrderPickerDialogView,
  template
) {
  'use strict';

  return View.extend({

    template,

    events: {
      'click #-setOrder': function()
      {
        this.showOrderPicker();
      },
      'click a[data-order]': function(e)
      {
        this.showOrderPicker(e.currentTarget.dataset.order);
      }
    },

    initialize: function()
    {
      this.listenTo(this.model.order, 'change', this.render);
      this.listenTo(this.model, 'change:orderQueue', this.render);
    },

    getTemplateData: function()
    {
      return {
        order: this.model.order.toJSON(),
        orderQueue: this.model.get('orderQueue') || [],
        canManage: !!this.model.get('line') && currentUser.isAllowedTo('EMBEDDED', 'GFT:MANAGE')
      };
    },

    showOrderPicker: function(orderNo)
    {
      const dialogView = new OrderPickerDialogView({
        vkb: this.options.vkb,
        orderNo,
        model: this.model
      });

      viewport.showDialog(dialogView, this.t('orderPicker:title'));
    }

  });
});
