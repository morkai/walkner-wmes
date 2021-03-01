// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/View',
  'app/data/localStorage',
  'app/wmes-gft-tester/templates/orderPickerDialog'
], function(
  _,
  viewport,
  View,
  localStorage,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wmes-gft-tester',

    dialogClassName: 'production-modal',

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.vkb)
        {
          this.options.vkb.show(e.currentTarget);
        }
      },
      'click .btn[data-id]': function(e)
      {
        this.$id('orderNo').val(e.currentTarget.dataset.id);
      },
      'submit': function(e)
      {
        e.preventDefault();

        this.$id('submit').prop('disabled', true).find('.fa-spinner').removeClass('hidden');

        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }

        const req = this.ajax({
          method: 'POST',
          url: `/gft/stations/${this.model.get('line')}/${this.model.get('station')}`,
          data: JSON.stringify({
            orderNo: this.$id('orderNo').val()
          })
        });

        req.fail(() =>
        {
          const error = req.responseJSON && req.responseJSON.error;
          let text = '';

          if (error)
          {
            text = this.t.has(`orderPicker:error:${error.code}`)
              ? this.t(`orderPicker:error:${error.code}`)
              : error.message;
          }
          else
          {
            text = this.t('orderPicker:error:generic');
          }

          viewport.msg.show({
            type: 'error',
            time: 3000,
            text
          });

          this.$id('submit').prop('disabled', false).find('.fa-spinner').addClass('hidden');
        });

        req.done(() =>
        {
          this.timers.closeDialog = setTimeout(() => viewport.closeDialog(), 6000);

          this.listenTo(this.model.order, 'change', () => viewport.closeDialog());
        });
      }
    },

    destroy: function()
    {
      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    onDialogShown: function()
    {
      this.$id('orderNo').focus();
    },

    afterRender: function()
    {
      this.$id('orderNo').val(this.options.orderNo || '');

      this.loadRecentOrders();
    },

    loadRecentOrders: function()
    {
      const req = this.ajax({url: `/gft/recentOrders/${this.model.get('line')}`});

      req.fail(() =>
      {
        this.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(res =>
      {
        const currentOrderNo = this.model.order.get('orderNo');
        let html = '';

        res.collection.forEach(order =>
        {
          if (order.orderNo === currentOrderNo)
          {
            return;
          }

          const orderNo = order.orderNo.match(/[0-9]{3}/g).join(' ');

          html += `<button type="button" class="btn btn-lg btn-default" data-id="${order.orderNo}">`
            + `${orderNo} &nbsp; <small>${_.escape(order.productName)}</small>`
            + '</button>';
        });

        this.$id('list').html(html);

        viewport.adjustDialogBackdrop();
      });
    }

  });
});
