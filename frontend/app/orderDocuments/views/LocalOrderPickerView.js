// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/orderDocuments/templates/localOrderPicker'
], function(
  _,
  $,
  js2form,
  form2js,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events :{
      'submit': function()
      {
        this.submitForm();

        return false;
      },
      'click #-numpad > .btn': function(e)
      {
        this.pressNumpadKey(e.currentTarget.dataset.key);
      },
      'click #-lastOrders > .btn': function(e)
      {
        this.selectOrderNo(e.currentTarget.dataset.order);
      }
    },

    initialize: function()
    {
      if (this.collection)
      {
        this.listenTo(this.collection, 'sync', this.renderLastOrders);
      }
    },

    afterRender: function()
    {
      js2form(this.el, {
        orderNo: ''
      });

      if (this.collection)
      {
        this.collection.fetch({reset: true});
      }
      else
      {
        this.$id('lastOrders').html('');
      }
    },

    renderLastOrders: function()
    {
      var usedOrdersMap = {};
      var usedOrdersCount = 0;
      var html = [];

      this.collection.forEach(function(pso)
      {
        var orderNo = pso.get('orderId');

        if (usedOrdersMap[orderNo] || usedOrdersCount === 5)
        {
          return;
        }

        usedOrdersMap[orderNo] = true;
        usedOrdersCount += 1;

        html.push(
          '<button type="button" class="btn btn-default btn-block" tabindex="-1" data-order="',
          orderNo,
          '">',
          orderNo,
          '</button>'
        );
      });

      this.$id('lastOrders').html(html.join(''));
    },

    submitForm: function()
    {
      var view = this;
      var $submit = this.$id('submit').prop('disabled', true);

      $submit.find('.fa').removeClass('fa-search').addClass('fa-spin fa-spinner');

      var orderNo = this.$id('orderNo').val();
      var req = this.ajax({
        type: 'GET',
        url: window.location.origin + '/orders/' + orderNo + '/documents'
      });

      req.fail(function(res)
      {
        var code = ((res.responseJSON || {}).error || {}).message;
        var text = t.has('orderDocuments', 'localOrderPicker:error:' + code)
          ? t('orderDocuments', 'localOrderPicker:error:' + code)
          : t('orderDocuments', 'localOrderPicker:error:failure');

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: text
        });
      });

      req.done(function(localOrder)
      {
        view.trigger('localOrder', localOrder);
      });

      req.always(function()
      {
        $submit
          .prop('disabled', false)
          .find('.fa')
          .removeClass('fa-spin fa-spinner')
          .addClass('fa-search');
      });
    },

    checkLocalServer: function()
    {
      var view = this;
      var req = this.ajax({
        type: 'GET',
        url: 'http://127.0.0.1:1335/hello'
      });

      var $warning = view.$('.message-warning').removeClass('hidden');
      var $success = view.$('.message-success').addClass('hidden');
      var $error = view.$('.message-error').addClass('hidden');

      req.always(function() { $warning.addClass('hidden');});
      req.done(function() { $success.removeClass('hidden'); });
      req.fail(function() { $error.removeClass('hidden');});
    },

    pressNumpadKey: function(key)
    {
      var inputEl = this.$id('orderNo')[0];
      var value = inputEl.value;
      var start = inputEl.selectionStart;
      var end = inputEl.selectionEnd;

      if (key === 'BACKSPACE')
      {
        start = start - 1;
        value = value.substring(0, start) + value.substring(end);
      }
      else if (key === 'LEFT')
      {
        start = start - 1;
      }
      else if (key === 'RIGHT')
      {
        start = start + 1;
      }
      else if (value.length < inputEl.maxLength)
      {
        value = value.substring(0, start) + key + value.substring(end);
        start = start + 1;
      }

      inputEl.value = value;
      inputEl.focus();
      inputEl.setSelectionRange(start, start);
    },

    selectOrderNo: function(orderNo)
    {
      var inputEl = this.$id('orderNo')[0];

      inputEl.value = orderNo;
      inputEl.focus();
      inputEl.setSelectionRange(orderNo.length, orderNo.length);
    }

  });
});
