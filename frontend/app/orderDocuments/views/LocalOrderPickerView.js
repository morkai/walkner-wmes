// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'js2form',
  'form2js',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/embedded',
  'app/prodShiftOrders/ProdShiftOrderCollection',
  'app/orderDocuments/templates/localOrderPicker'
], function(
  _,
  $,
  js2form,
  form2js,
  t,
  viewport,
  View,
  embedded,
  ProdShiftOrderCollection,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'orderDocuments-localOrderPicker-dialog',

    template: template,

    events: {
      'submit': function()
      {
        this.submitForm();

        return false;
      },
      'click #-numpad > .btn': function(e)
      {
        this.pressNumpadKey(e.currentTarget.dataset.key);
        this.toggleSubmit();
      },
      'click #-plannedOrders > .btn': function(e)
      {
        this.selectOrderNo(e.currentTarget.dataset.order);
        this.toggleSubmit();
      },
      'click #-lastOrders > .btn': function(e)
      {
        this.selectOrderNo(e.currentTarget.dataset.order);
        this.toggleSubmit();
      },
      'input #-orderNo': 'toggleSubmit'
    },

    initialize: function()
    {
      this.plannedOrders = null;

      this.lastOrders = new ProdShiftOrderCollection(null, {
        rqlQuery: 'select(orderId)&sort(-startedAt)&limit(10)&prodLine=' + this.model.get('prodLine')._id
      });

      this.listenTo(this.lastOrders, 'sync', this.renderLastOrders);
    },

    getTemplateData: function()
    {
      return {
        touch: embedded.isEnabled()
      };
    },

    afterRender: function()
    {
      js2form(this.el, {
        orderNo: ''
      });

      this.lastOrders.fetch({reset: true});

      this.fetchPlannedOrders();
    },

    fetchPlannedOrders: function()
    {
      var view = this;
      var req = $.ajax({url: '/production/orderQueue/' + view.model.get('prodLine')._id});

      req.fail(function()
      {
        view.plannedOrders = [];
      });

      req.done(function(res)
      {
        view.plannedOrders = res.map(function(result) { return result.order.no; });
      });

      req.always(view.renderPlannedOrders.bind(view));
    },

    renderLastOrders: function()
    {
      var usedOrdersMap = {};
      var usedOrdersCount = 0;
      var html = [];

      this.lastOrders.forEach(function(pso)
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

      this.$id('lastOrders').find('.fa-spinner').replaceWith(html.join(''));
    },

    renderPlannedOrders: function()
    {
      var html = [];

      this.plannedOrders.forEach(function(orderNo)
      {
        html.push(
          '<button type="button" class="btn btn-default btn-block" tabindex="-1" data-order="',
          orderNo,
          '">',
          orderNo,
          '</button>'
        );
      });

      this.$id('plannedOrders').find('.fa-spinner').replaceWith(html.join(''));
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);

      $submit.find('.fa').removeClass('fa-search').addClass('fa-spin fa-spinner');

      var no = view.$id('orderNo').val();
      var kind = no.length === 15 ? 'document' : 'order';
      var req = view[kind === 'document' ? 'findDocument' : 'findOrder'](no);

      req.fail(function(res)
      {
        var code = ((res.responseJSON || {}).error || {}).message;

        if (res.status === 404)
        {
          code = 'NOT_FOUND';
        }

        var text = t.has('orderDocuments', 'localOrderPicker:error:' + code)
          ? view.t('localOrderPicker:error:' + code)
          : t.has('orderDocuments', 'localOrderPicker:error:' + code + ':' + kind)
          ? view.t('localOrderPicker:error:' + code + ':' + kind)
          : view.t('localOrderPicker:error:failure');

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: text
        });
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

    findOrder: function(orderNo)
    {
      var view = this;
      var req = view.ajax({
        type: 'GET',
        url: '/orders/' + orderNo + '/documents',
        data: {
          line: view.model.get('prodLine')._id,
          station: view.model.get('station')
        }
      });

      req.done(function(localOrder)
      {
        view.trigger('localOrder', localOrder);
      });

      return req;
    },

    findDocument: function(nc15)
    {
      var view = this;
      var req = view.ajax({
        type: 'HEAD',
        url: '/orderDocuments/' + nc15 + '?name=1'
      });

      req.done(function()
      {
        view.trigger('document', {
          nc15: nc15,
          name: req.getResponseHeader('X-Document-Name'),
          source: req.getResponseHeader('X-Document-Source')
        });
      });

      return req;
    },

    pressNumpadKey: function(key)
    {
      var inputEl = this.$id('orderNo')[0];
      var value = inputEl.value;
      var start = inputEl.selectionStart;
      var end = inputEl.selectionEnd;

      if (key === 'CLEAR')
      {
        start = 0;
        value = '';
      }
      else if (key === 'BACKSPACE')
      {
        start -= 1;
        value = value.substring(0, start) + value.substring(end);
      }
      else if (key === 'LEFT')
      {
        start -= 1;
      }
      else if (key === 'RIGHT')
      {
        start += 1;
      }
      else if (value.length < inputEl.maxLength)
      {
        value = value.substring(0, start) + key + value.substring(end);
        start += 1;
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
    },

    toggleSubmit: function()
    {
      var length = this.$id('orderNo').val().replace(/[^0-9]+/, '').length;
      var label = 'localOrderPicker:submit';

      if (length === 15)
      {
        label += ':document';
      }
      else if (length === 9)
      {
        label += ':order';
      }

      this.$id('submit').find('span').text(t('orderDocuments', label));
    }

  });
});
