// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/data/orgUnits',
  'app/orderStatuses/util/renderOrderStatusLabel',
  '../util/scrollIntoView',
  'app/planning/templates/orders',
  'app/planning/templates/orderPopover'
], function(
  _,
  $,
  View,
  orgUnits,
  renderOrderStatusLabel,
  scrollIntoView,
  ordersTemplate,
  orderPopoverTemplate
) {
  'use strict';

  return View.extend({

    template: ordersTemplate,

    events: {
      'mouseenter .is-order': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'orders',
          state: true,
          orderNo: e.currentTarget.dataset.id
        });
      },
      'mouseleave .is-order': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'orders',
          state: false,
          orderNo: e.currentTarget.dataset.id
        });
      }
    },

    localTopics: {
      'planning.windowResized': 'resize'
    },

    initialize: function()
    {
      var view = this;
      var mrp = view.mrp;
      var plan = view.plan;

      view.listenTo(mrp.orders, 'added changed', view.onOrdersChanged);
      view.listenTo(mrp.orders, 'removed', view.onOrdersRemoved);
      view.listenTo(mrp.orders, 'highlight', view.onOrderHighlight);
      view.listenTo(plan.displayOptions, 'change:useLatestOrderData', view.render);
      view.listenTo(plan.sapOrders, 'reset', view.onSapOrdersReset);
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      var plan = this.plan;

      return {
        idPrefix: this.idPrefix,
        orders: this.mrp.orders.map(function(order)
        {
          var orderData = plan.getActualOrderData(order.id);

          return {
            _id: order.id,
            kind: order.get('kind'),
            incomplete: order.get('incomplete') > 0,
            completed: orderData.quantityDone >= orderData.quantityTodo,
            surplus: orderData.quantityDone > orderData.quantityTodo,
            invalid: false,
            ignored: order.get('ignored'),
            confirmed: orderData.statuses.indexOf('CNF') !== -1,
            delivered: orderData.statuses.indexOf('DLV') !== -1,
            customQuantity: order.get('quantityPlan') > 0
          };
        })
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$id('list').on('scroll', function(e)
      {
        view.$id('scrollIndicator').toggleClass('hidden', e.target.scrollLeft <= 40);
      });

      view.resize();

      view.$el.popover({
        container: view.el,
        selector: '.planning-mrp-list-item',
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: function() { return view.serializePopover(this.dataset.id); },
        template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      });
    },

    resize: function()
    {
      var $edit = this.$id('edit');
      var $scrollIndicator = this.$id('scrollIndicator');
      var pos = $edit.position();

      $scrollIndicator.css({
        top: (pos.top + 1) + 'px',
        left: ($edit.outerWidth() + pos.left) + 'px'
      });
    },

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializePopover: function(id)
    {
      var order = this.plan.orders.get(id);

      if (!order)
      {
        return null;
      }

      var orderData = this.plan.getActualOrderData(order.id);
      var operation = order.get('operation');

      return orderPopoverTemplate({
        order: {
          _id: order.id,
          nc12: order.get('nc12'),
          name: order.get('name'),
          kind: order.get('kind'),
          incomplete: order.get('incomplete'),
          completed: orderData.quantityDone >= orderData.quantityTodo,
          surplus: orderData.quantityDone > orderData.quantityTodo,
          quantityTodo: orderData.quantityTodo,
          quantityDone: orderData.quantityDone,
          quantityPlan: order.get('quantityPlan'),
          ignored: order.get('ignored'),
          statuses: orderData.statuses.map(renderOrderStatusLabel),
          manHours: order.get('manHours'),
          laborTime: operation && operation.laborTime ? operation.laborTime : 0
        }
      });
    },

    onOrdersChanged: function()
    {
      this.render();
    },

    onOrdersRemoved: function(removedOrders)
    {
      var view = this;

      removedOrders.forEach(function(removedOrder)
      {
        view.$item(removedOrder.id).remove();
      });
    },

    onOrderHighlight: function(message)
    {
      var $item = this.$('.is-order[data-id^="' + message.orderNo + '"]').toggleClass('is-highlighted', message.state);

      if (!this.plan.displayOptions.isListWrappingEnabled())
      {
        scrollIntoView($item[0]);
      }
    },

    onSapOrdersReset: function(sapOrders, options)
    {
      if (!options.reload && this.plan.displayOptions.isLatestOrderDataUsed())
      {
        this.render();
      }
    }

  });
});
