// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/paintShop/templates/list'
], function(
  $,
  t,
  viewport,
  View,
  listTemplate
) {
  'use strict';

  return View.extend({

    template: listTemplate,

    events: {
      'mousedown .paintShop-list-item': function(e)
      {
        this.lastClickEvent = e;
      },
      'mouseup .paintShop-list-item': function(e)
      {
        var lastE = this.lastClickEvent;

        if (!lastE || e.button !== 0)
        {
          return;
        }

        if (window.parent === window
          || (lastE.offsetY === e.offsetY
          && lastE.offsetX === e.offsetX
          && lastE.screenX === e.screenX
          && lastE.screenY === e.screenY))
        {
          this.handleItemClick(e.currentTarget.dataset.orderId);
        }

        this.lastClickEvent = null;
      }
    },

    initialize: function()
    {
      this.lastClickEvent = null;

      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'change', this.onChange);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showTimes: this.options.showTimes,
        orders: this.serializeOrders()
      };
    },

    serializeOrders: function()
    {
      var orders = [];
      var filter = this.options.filter || function() { return true; };
      var sort = this.options.sort;

      this.model.serializeGroups(filter).forEach(function(group)
      {
        group.orders.forEach(function(order)
        {
          orders.push(order);
        });
      });

      if (sort)
      {
        orders.sort(sort);
      }

      return orders;
    },

    $item: function(orderId)
    {
      return this.$('.paintShop-list-item[data-order-id="' + orderId + '"]');
    },

    handleItemClick: function(orderId)
    {
      if (orderId)
      {
        this.model.trigger('focus', orderId);
      }
    },

    onChange: function(order)
    {
      var $item = this.$item(order.id);

      if (!this.options.filter)
      {
        $item.attr('data-status', order.get('status'));

        return;
      }

      if ($item.length || this.options.filter(order.serialize()))
      {
        this.render();
      }
    }

  });
});
