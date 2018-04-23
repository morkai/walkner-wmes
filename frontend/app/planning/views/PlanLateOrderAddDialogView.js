// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/lateOrderAddDialog'
], function(
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      }

    },

    afterRender: function()
    {
      var mrp = this.mrp;
      var data = this.plan.lateOrders
        .filter(function(order)
        {
          return order.get('mrp') === mrp.id && !mrp.orders.get(order.id);
        })
        .map(function(order)
        {
          return {
            id: order.id,
            text: order.id + ': ' + order.get('name')
          };
        });

      this.$id('orders').select2({
        width: '100%',
        placeholder: ' ',
        multiple: true,
        data: data,
        formatSelection: function(item) { return item.id; }
      });
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var req = view.ajax({
        method: 'POST',
        url: '/planning/plans/' + view.plan.id + '/orders',
        data: JSON.stringify({
          orders: view.$id('orders').val().split(','),
          urgent: true
        })
      });

      req.done(function()
      {
        viewport.closeDialog();
      });
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'lateOrders:add:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('orders').focus();
    }

  });
});
