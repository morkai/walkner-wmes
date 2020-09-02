// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/wmes-compRel-entries/templates/details/releaseOrder'
], function(
  time,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'change #-orders': function(e)
      {
        e.target.value = e.target.value.split(/[^0-9]+/).filter(function(v) { return v.length === 9; }).join(' ');
      },

      'change input[name="mode"]': function()
      {
        var ordersMode = this.$('input[name="mode"]:checked').val() === 'orders';
        var $validDate = this.$('input[type="date"]');
        var $orders = this.$id('orders');

        $validDate.prop('disabled', ordersMode);
        $orders.prop('disabled', !ordersMode);
      },

      'submit': function()
      {
        this.submit();

        return false;
      }

    },

    onDialogShown: function()
    {
      this.$id('validFrom').focus();
    },

    getTemplateData: function()
    {
      return {
        minDate: window.PRODUCTION_DATA_START_DATE || time.format(Date.now(), 'YYYY-01-01'),
        maxDate: time.getMoment().add(1, 'years').format('YYYY-MM-DD')
      };
    },

    submit: function()
    {
      var view = this;

      viewport.msg.saving();

      view.$id('submit').prop('disabled', true);

      var mode = view.$('input[name="mode"]:checked').val();
      var data = {
        comment: view.$id('comment').val().trim()
      };

      if (mode === 'orders')
      {
        data.orders = view.$id('orders').val().split(/[^0-9]+/).filter(function(v) { return v.length === 9; });
      }
      else
      {
        data.validFrom = this.$id('validFrom').val() || '2000-01-01';
        data.validTo = this.$id('validTo').val() || '2100-01-01';
      }

      var req = view.ajax({
        method: 'POST',
        url: '/compRel/entries/' + view.model.id + ';release-order',
        data: JSON.stringify(data)
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();

        view.$id('submit').prop('disabled', false);
      });

      req.done(function()
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });
    }

  });
});
