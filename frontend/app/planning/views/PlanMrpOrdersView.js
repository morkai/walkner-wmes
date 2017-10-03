// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/data/orgUnits',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning/templates/orders',
  'app/planning/templates/orderPopover'
], function(
  _,
  $,
  View,
  orgUnits,
  renderOrderStatusLabel,
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
      this.listenTo(this.mrp.orders, 'added changed', this.onOrdersChanged);
      this.listenTo(this.mrp.orders, 'removed', this.onOrdersRemoved);
      this.listenTo(this.mrp.orders, 'highlight', this.onOrderHighlight);
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        orders: this.mrp.orders.map(function(order)
        {
          return {
            _id: order.id,
            kind: order.get('kind'),
            incomplete: order.get('incomplete') > 0,
            completed: order.get('quantityDone') >= order.get('quantityTodo'),
            surplus: order.get('quantityDone') > order.get('quantityTodo'),
            invalid: false,
            ignored: order.get('ignored'),
            confirmed: order.get('statuses').indexOf('CNF') !== -1,
            delivered: order.get('statuses').indexOf('DLV') !== -1,
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

      var quantityTodo = order.get('quantityTodo');
      var quantityDone = order.get('quantityDone');
      var quantityPlan = order.get('quantityPlan');
      var operation = order.get('operation');

      return orderPopoverTemplate({
        order: {
          _id: order.id,
          nc12: order.get('nc12'),
          name: order.get('name'),
          kind: order.get('kind'),
          incomplete: order.get('incomplete'),
          completed: quantityDone >= quantityTodo,
          surplus: quantityDone > quantityTodo,
          quantityTodo: quantityTodo,
          quantityDone: quantityDone,
          quantityPlan: quantityPlan,
          ignored: order.get('ignored'),
          statuses: order.get('statuses').map(renderOrderStatusLabel),
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
      this.$('.is-order[data-id^="' + message.orderNo + '"]').toggleClass('is-highlighted', message.state);
    }

  });
});
