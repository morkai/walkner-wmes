// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  '../util/openOrderPrint',
  'app/orders/templates/openOrdersPrint'
], function(
  _,
  t,
  viewport,
  View,
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

        var url = '/orders/' + orders.join('+') + '.html?print';

        view.$el.attr('action', url);

        if (openOrderPrint(null, view.el))
        {
          window.location.href = url;
        }
        else
        {
          view.$id('orders').select();
        }
      });
    }

  });
});
