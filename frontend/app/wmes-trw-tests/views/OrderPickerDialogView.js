// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/wmes-trw-tests/templates/orderPicker'
], function(
  _,
  $,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.vkb)
        {
          this.options.vkb.show(e.currentTarget);
        }
      },
      'click .trw-testing-list .btn': function(e)
      {
        this.$id('order').val(e.currentTarget.dataset.id);
        this.validateOrder();
      },
      'input #-order': function()
      {
        this.validateOrder();
      },
      'click #-noOrder': function()
      {
        this.trigger('picked', {
          order: '000000000',
          qtyTodo: 0
        });
      },
      'submit': function(e)
      {
        e.preventDefault();

        var $order = this.$id('order');
        var data = {
          order: $order.val(),
          qtyTodo: $order.data('qty')
        };

        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }

        this.trigger('picked', data);
      }
    },

    initialize: function()
    {
      $(window).on('resize.' + this.idPrefix, this.resize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    onDialogShown: function()
    {
      this.resize();
      this.$id('order').focus();
    },

    afterRender: function()
    {
      var order = this.model.get('order') || '';

      if (order === '000000000')
      {
        order = '';
      }

      this.$id('order').val(order);
      this.loadOrders();
      this.validateOrder();
    },

    resize: function()
    {
      if (!this.heightOffset)
      {
        this.heightOffset = this.$el.closest('.modal-content').outerHeight()
          - this.$id('doneGroup').outerHeight() + 25 + 60;
      }

      var height = window.innerHeight - this.heightOffset;

      this.$('.trw-testing-list').css('height', height + 'px');
    },

    loadOrders: function()
    {
      var view = this;
      var req = view.ajax({
        url: '/production/planExecution/' + encodeURIComponent(this.model.get('line')) + '?queue=0'
      });

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function(res)
      {
        renderOrders('done', res.execution.doneOrders);
        renderOrders('todo', res.execution.todoOrders);
      });

      function renderOrders(type, orders)
      {
        var html = '';

        orders.forEach(function(order)
        {
          html += '<button type="button" class="btn btn-lg btn-block btn-default"'
            + ' data-id="' + order.orderId + '">'
            + order.orderId.match(/[0-9]{3}/g).join(' ')
            + '</button>';
        });

        html += '<div class="trw-testing-list-last"></div>';

        view.$id(type).html(html);
      }
    },

    validateOrder: function()
    {
      var view = this;
      var $submit = view.$('.btn-primary').prop('disabled', true);
      var $order = view.$id('order');
      var orderNo = $order.val();

      $order[0].setCustomValidity('');

      if (!/^[0-9]{9}$/.test(orderNo))
      {
        $submit.prop('disabled', false);

        return;
      }

      if (view.validateReq)
      {
        view.validateReq.abort();
      }

      view.validateReq = view.ajax({
        url: '/orders/' + orderNo + '?select(_id,qty)'
      });

      view.validateReq.fail(function()
      {
        if (view.validateReq.status === 404)
        {
          $order[0].setCustomValidity(view.t('orderPicker:notFound'));
        }
      });

      view.validateReq.done(function(order)
      {
        $order.data('qty', order.qty);
      });

      view.validateReq.always(function()
      {
        if (view.validateReq.statusText === 'abort')
        {
          return;
        }

        $submit.prop('disabled', false);

        view.validateReq = null;
      });
    }

  });
});
