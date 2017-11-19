// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './PaintShopOrderDetailsView',
  'app/paintShop/templates/queue',
  'app/paintShop/templates/queueOrder'
], function(
  _,
  $,
  t,
  viewport,
  View,
  PaintShopOrderDetailsView,
  queueTemplate,
  queueOrderTemplate
) {
  'use strict';

  return View.extend({

    template: queueTemplate,

    events: {
      'mousedown .paintShop-order': function(e)
      {
        this.lastClickEvent = e;
      },
      'mouseup .paintShop-order': function(e)
      {
        var lastE = this.lastClickEvent;

        this.lastClickEvent = null;

        if (!lastE || e.button !== 0 || window.getSelection().toString() !== '')
        {
          return;
        }

        if (window.parent === window
          || (lastE.offsetY === e.offsetY
          && lastE.offsetX === e.offsetX
          && lastE.screenX === e.screenX
          && lastE.screenY === e.screenY))
        {
          this.handleOrderClick(
            e.currentTarget.dataset.orderId,
            this.$(e.target).closest('td')[0].dataset.property
          );
        }
      },
      'scroll': 'onScroll'
    },

    initialize: function()
    {
      this.lastClickEvent = null;
      this.lastFocusedOrder = null;
      this.onScroll = _.debounce(this.onScroll.bind(this), 100, false);

      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'change', this.onChange);
      this.listenTo(this.model, 'focus', this.onFocus);
      this.listenTo(this.model, 'mrpSelected', this.onMrpSelected);
    },

    serialize: function()
    {
      var first = null;
      var last = null;
      var selectedMrp = this.model.selectedMrp;
      var orders = this.model.serialize().map(function(order)
      {
        order = {
          order: order,
          visible: selectedMrp === 'all' || order.mrp === selectedMrp,
          first: false,
          last: false,
          commentVisible: true
        };

        if (order.visible)
        {
          if (!first)
          {
            first = order;
          }

          last = order;
        }

        return order;
      });

      if (first)
      {
        first.first = true;
      }

      if (last)
      {
        last.last = true;
      }

      return {
        idPrefix: this.idPrefix,
        orders: orders,
        renderQueueOrder: queueOrderTemplate
      };
    },

    afterRender: function()
    {
      var $focused = this.$order(this.lastFocusedOrder);

      if ($focused.length)
      {
        this.el.scrollTop = $focused[0].offsetTop + 1;
      }
    },

    $order: function(orderId)
    {
      return this.$('.paintShop-order[data-order-id="' + orderId + '"]');
    },

    handleOrderClick: function(orderId, property)
    {
      if (viewport.currentDialog)
      {
        return;
      }

      var order = this.model.get(orderId);

      if (!order)
      {
        return;
      }

      var followups = order.get('followups');

      if (followups.length && (property === 'no' || property === 'order'))
      {
        this.onFocus(followups[0]);

        return;
      }

      var orderEl = this.$order(orderId)[0];

      if (orderEl)
      {
        this.$el.animate({scrollTop: orderEl.offsetTop + 1}, 200);

        this.lastFocusedOrder = orderId;
      }

      var detailsView = new PaintShopOrderDetailsView({
        model: order,
        height: orderEl ? orderEl.clientHeight : 0,
        vkb: this.options.vkb
      });

      viewport.showDialog(detailsView);
    },

    onScroll: function()
    {
      var $visible = this.$('.visible');

      if (!$visible.length)
      {
        return;
      }

      this.lastFocusedOrder = $visible[0].dataset.orderId;

      var scrollTop = this.el.scrollTop;

      for (var i = 0; i < $visible.length; ++i)
      {
        var el = $visible[i];

        if (el.offsetTop > scrollTop)
        {
          break;
        }

        this.lastFocusedOrder = el.dataset.orderId;

        if (scrollTop > el.offsetTop + 26 && $visible[i + 1])
        {
          this.lastFocusedOrder = $visible[i + 1].dataset.orderId;
        }
      }
    },

    onChange: function(order)
    {
      var $order = this.$order(order.id);

      $order.replaceWith(queueOrderTemplate({
        order: order.serialize(),
        visible: this.model.isVisible(order),
        first: $order.hasClass('is-first'),
        last: $order.hasClass('is-last'),
        commentVisible: true
      }));
    },

    onFocus: function(orderId)
    {
      var orderEl = this.$order(orderId)[0];

      if (orderEl)
      {
        this.$el.animate({scrollTop: orderEl.offsetTop + 1}, 200);

        this.lastFocusedOrder = orderId;
      }
      else
      {
        this.handleOrderClick(orderId);
      }
    },

    onMrpSelected: function()
    {
      var selectedMrp = this.model.selectedMrp;
      var specificMrp = selectedMrp !== 'all';

      this.$('.paintShop-order').each(function()
      {
        var hidden = specificMrp && this.dataset.mrp !== selectedMrp;

        this.classList.toggle('hidden', hidden);
        this.classList.toggle('visible', !hidden);
      });

      this.$('.paintShop-order.is-first, .paintShop-order.is-last').removeClass('is-first is-last');

      var $visible = this.$('.visible');

      $visible.first().addClass('is-first');
      $visible.last().addClass('is-last');

      this.el.scrollTop = 0;
    }

  });
});
