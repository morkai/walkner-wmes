// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/orderDropZoneDialog'
], function(
  t,
  time,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': 'submitForm',

      'blur #-orders': function()
      {
        var $orders = this.$id('orders');
        var orders = $orders.val().match(/([0-9]{9})/g);

        $orders.val(orders ? orders.join(', ') : '');
      },

      'blur #-dropZone': 'toggleRequired'

    },

    serialize: function()
    {
      var planOrder = this.order;
      var sapOrder = this.plan.sapOrders.get(planOrder.id);
      var dropZone = sapOrder.get('whDropZone') || '';
      var orders = [planOrder.id];

      if (dropZone)
      {
        this.plan.sapOrders.forEach(function(nextSapOrder)
        {
          if (nextSapOrder.id === sapOrder.id)
          {
            return;
          }

          var nextDropZone = nextSapOrder.get('whDropZone') || '';

          if (nextDropZone === dropZone)
          {
            orders.push(nextSapOrder.id);
          }
        });
      }

      return {
        idPrefix: this.idPrefix,
        status: this.plan.sapOrders.getWhStatus(sapOrder.id),
        dropZone: dropZone,
        time: sapOrder.get('whTime')
          ? time.utc.format(sapOrder.get('whTime'), 'HH:mm')
          : time.format(Date.now(), 'HH:mm'),
        orders: orders.join(', '),
        canChangeDropZone: this.plan.canChangeWhDropZone(),
        canChangeStatus: this.plan.canChangeWhStatus()
      };
    },

    afterRender: function()
    {
      this.toggleRequired();
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var canChangeStatus = view.plan.canChangeWhStatus();
      var comment = canChangeStatus ? view.$id('comment').val().trim() : undefined;
      var whStatus = canChangeStatus ? view.$('input[name="status"]:checked').val() : undefined;
      var whDropZone = view.$id('dropZone').val().trim();
      var whTimeMoment = time.utc.getMoment('2000-01-01 ' + view.$id('time').val().trim(), 'YYYY-MM-DD HH:mm');
      var whTime = whDropZone === '' || !whTimeMoment.isValid()
        ? null
        : whTimeMoment.toISOString();

      if (!whTime)
      {
        whDropZone = '';
      }

      if (!view.plan.canChangeWhDropZone())
      {
        whDropZone = undefined;
        whTime = undefined;
      }

      var req = view.ajax({
        method: 'POST',
        url: '/orders',
        data: JSON.stringify(this.$id('orders').val().match(/([0-9]{9})/g).map(function(orderNo)
        {
          return {
            _id: orderNo,
            source: 'wh',
            comment: comment,
            whStatus: whStatus,
            whDropZone: whDropZone,
            whTime: whTime
          };
        }))
      });

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'orders:menu:dropZone:failure')
        });

        view.plan.settings.trigger('errored');
      });

      return false;
    },

    toggleRequired: function()
    {
      var required = this.$id('dropZone').val().trim().length > 0;

      this.$id('time').prop('required', required);
    },

    onDialogShown: function()
    {
      if (this.plan.canChangeWhDropZone())
      {
        this.$id('dropZone').focus();
      }
    }

  });
});
