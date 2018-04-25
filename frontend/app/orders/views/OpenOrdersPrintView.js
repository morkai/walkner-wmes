// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/printers/views/PrinterPickerView',
  '../util/openOrderPrint',
  'app/orders/templates/openOrdersPrint'
], function(
  _,
  t,
  viewport,
  View,
  PrinterPickerView,
  openOrderPrint,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'input #-orders': function(e)
      {
        e.target.setCustomValidity('');
      },
      'change #-orders': function()
      {
        this.$id('orders').val(this.serializeOrders().join(', '));
      },
      'submit': function()
      {
        this.findAndPrint(this.serializeOrders());

        return false;
      }
    },

    afterRender: function()
    {
      PrinterPickerView.selectField(this, {tag: 'orders'});
    },

    onDialogShown: function()
    {
      this.$id('orders').focus();
    },

    serializeOrders: function()
    {
      return this.$id('orders').val().split(/[^0-9]/).filter(function(d) { return !!d.length; });
    },

    findAndPrint: function(orders)
    {
      var view = this;
      var req = this.ajax({
        url: '/orders?select(_id)&limit(100)&_id=in=(' + orders + ')'
      });

      req.fail(function()
      {
        viewport.msg.error({
          type: 'error',
          time: 3000,
          text: t('orders', 'openOrdersPrint:msg:findFailure')
        });
      });

      req.done(function(res)
      {
        if (res.totalCount !== orders.length)
        {
          var foundOrders = _.pluck(res.collection, '_id');
          var notFoundOrders = _.filter(orders, function(orderNo) { return !_.includes(foundOrders, orderNo); });

          view.$id('orders')[0].setCustomValidity(t('orders', 'openOrdersPrint:msg:notFound', {
            count: notFoundOrders.length,
            orders: notFoundOrders.join(', ')
          }));
          view.$id('submit').click();

          return;
        }

        openOrderPrint(orders, view.$id('printer').val() || null);
      });
    }

  });
});
