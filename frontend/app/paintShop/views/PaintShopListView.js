// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/paintShop/templates/list'
], function(
  _,
  $,
  t,
  time,
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
      this.onScroll = _.debounce(this.onScroll.bind(this), 100, false);

      this.lastClickEvent = null;
      this.lastVisibleItem = null;

      this.listenTo(this.model, 'reset', _.after(2, this.render));
      this.listenTo(this.model, 'change', this.onChange);
      this.listenTo(this.model, 'mrpSelected paintSelected', this.toggleVisibility);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showTimes: this.options.showTimes,
        isVisible: this.model.isVisible.bind(this.model),
        orders: this.serializeOrders()
      };
    },

    serializeOrders: function()
    {
      var filter = this.options.filter;
      var sort = this.options.sort;
      var orders = this.model.serialize();

      if (filter)
      {
        orders = orders.filter(filter);
      }

      if (sort)
      {
        orders = orders.sort(sort);
      }

      return orders;
    },

    afterRender: function()
    {
      var $visible = this.$item(this.lastVisibleItem);

      if ($visible.length)
      {
        this.el.parentNode.scrollTop = $visible[0].offsetTop;
      }
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

    onScroll: function()
    {
      var $visible = this.$('.visible');

      if (!$visible.length)
      {
        return;
      }

      var parent = this.el.parentNode;

      if (!parent)
      {
        return;
      }

      this.lastVisibleItem = $visible[0].dataset.orderId;

      var scrollTop = parent.scrollTop;

      for (var i = 0; i < $visible.length; ++i)
      {
        var el = $visible[i];

        if (el.offsetTop > scrollTop)
        {
          break;
        }

        this.lastVisibleItem = el.dataset.orderId;

        if (scrollTop > el.offsetTop + 25 && $visible[i + 1])
        {
          this.lastVisibleItem = $visible[i + 1].dataset.orderId;
        }
      }
    },

    onChange: function(order)
    {
      var filter = this.options.filter;
      var sort = this.options.sort;
      var $item = this.$item(order.id);

      if (!filter && !sort)
      {
        $item.attr('data-status', order.get('status'));

        return;
      }

      if ($item.length && !filter(order.serialize()))
      {
        $item.remove();

        return;
      }

      this.render();
    },

    toggleVisibility: function()
    {
      var orders = this.model;

      this.$('.paintShop-list-item').each(function()
      {
        if (!this.nextElementSibling)
        {
          return;
        }

        var order = orders.get(this.dataset.orderId);
        var hidden = !order || !orders.isVisible(order.serialize());

        this.classList.toggle('hidden', hidden);
        this.classList.toggle('visible', !hidden);
      });
    }

  });
});
