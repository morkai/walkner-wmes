// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/planning/util/contextMenu',
  './PaintShopOrderDetailsView',
  'app/paintShop/templates/queue',
  'app/paintShop/templates/queueOrder'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  contextMenu,
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
      'scroll': 'onScroll',
      'contextmenu .visible': function(e)
      {
        this.showMenu(e);

        return false;
      }
    },

    initialize: function()
    {
      this.lastClickEvent = null;
      this.lastFocusedOrder = null;
      this.onScroll = _.debounce(this.onScroll.bind(this), 100, false);

      this.listenTo(this.orders, 'reset', this.render);
      this.listenTo(this.orders, 'change', this.onChange);
      this.listenTo(this.orders, 'focus', this.onFocus);
      this.listenTo(this.orders, 'mrpSelected', this.onMrpSelected);
    },

    serialize: function()
    {
      var first = null;
      var last = null;
      var collection = this.orders;
      var orders = collection.serialize().map(function(order)
      {
        order = {
          order: order,
          visible: collection.selectedMrp === 'all' || order.mrp === collection.selectedMrp,
          first: false,
          last: false,
          commentVisible: true,
          rowSpan: 'rowSpan'
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

      var order = this.orders.get(orderId);

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

    showMenu: function(e)
    {
      var order = this.orders.get(e.currentTarget.dataset.orderId);
      var orderNo = order.get('order');
      var mrp = order.get('mrp');
      var menu = [
        order.get('order'),
        {
          label: t('paintShop', 'menu:printOrder'),
          handler: this.trigger.bind(this, 'actionRequested', 'printOrders', 'order', orderNo)
        },
        '-',
        t('paintShop', 'menu:header:mrp', {mrp: mrp}),
        {
          label: t('paintShop', 'menu:copyOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyOrders', e, mrp)
        },
        {
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyChildOrders', e, mrp)
        },
        {
          label: t('paintShop', 'menu:printOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'printOrders', 'mrp', mrp)
        }
      ];

      if (user.isAllowedTo('PAINT_SHOP:DROP_ZONES'))
      {
        menu.push({
          label: t('paintShop', 'menu:dropZone:' + this.dropZones.getState(mrp)),
          handler: this.trigger.bind(this, 'actionRequested', 'dropZone', mrp)
        });
      }

      menu.push(
        '-',
        t('paintShop', 'menu:header:all'),
        {
          label: t('paintShop', 'menu:copyOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyOrders', e, null)
        },
        {
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyChildOrders', e, null)
        },
        {
          label: t('paintShop', 'menu:printOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'printOrders')
        }
      );

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
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
        visible: this.orders.isVisible(order),
        first: $order.hasClass('is-first'),
        last: $order.hasClass('is-last'),
        commentVisible: true,
        rowSpan: 'rowSpan'
      }));
    },

    onFocus: function(orderId, options)
    {
      var orderEl = this.$order(orderId)[0];

      if (orderEl)
      {
        this.$el.animate({scrollTop: orderEl.offsetTop + 1}, 200);

        this.lastFocusedOrder = orderId;

        if (options && options.showDetails)
        {
          this.handleOrderClick(orderId);
        }
      }
      else
      {
        this.handleOrderClick(orderId);
      }
    },

    onMrpSelected: function()
    {
      var selectedMrp = this.orders.selectedMrp;
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
