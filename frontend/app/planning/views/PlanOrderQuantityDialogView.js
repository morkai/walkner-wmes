// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/orderQuantityDialog'
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

    serialize: function()
    {
      var order = this.order;

      return {
        idPrefix: this.idPrefix,
        orderNo: order.id,
        quantity: {
          todo: order.get('quantityTodo'),
          done: order.get('quantityDone'),
          plan: order.get('quantityPlan'),
          remaining: order.get('quantityTodo') - order.get('quantityDone'),
          incomplete: order.get('incomplete')
        }
      };
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var req = view.ajax({
        method: 'PATCH',
        url: '/planning/plans/' + view.plan.id + '/orders/' + view.order.id,
        data: JSON.stringify({
          quantityPlan: Math.max(0, parseInt(view.$id('quantityPlan').val(), 10) || 0)
        })
      });

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'orders:menu:quantity:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('quantityPlan').focus();
    }

  });
});
