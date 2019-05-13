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

        if (!this.options.embedded)
        {
          return;
        }

        if (this.timers.showMenu)
        {
          clearTimeout(this.timers.showMenu);
        }

        this.timers.showMenu = setTimeout(this.showMenu.bind(this, e), 300);
      },
      'mouseup .paintShop-order': function(e)
      {
        if (this.options.embedded && !this.timers.showMenu)
        {
          return;
        }

        clearTimeout(this.timers.showMenu);
        this.timers.showMenu = null;

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
      'contextmenu .visible': function(e)
      {
        this.showMenu(e);

        return false;
      }
    },

    initialize: function()
    {
      this.onScroll = _.debounce(this.onScroll.bind(this), 100, false);

      this.lastClickEvent = null;
      this.lastFocusedOrder = null;

      this.listenTo(this.orders, 'reset', _.after(2, this.render));
      this.listenTo(this.orders, 'change', this.onChange);
      this.listenTo(this.orders, 'focus', this.onFocus);
      this.listenTo(this.orders, 'mrpSelected paintSelected', this.toggleVisibility);
      this.listenTo(this.orders, 'paintSelected', this.toggleChildOrderDropZones);

      this.listenTo(this.dropZones, 'updated', this.onDropZoneUpdated);
    },

    getTemplateData: function()
    {
      var view = this;
      var first = null;
      var last = null;
      var getChildOrderDropZoneClass = view.orders.getChildOrderDropZoneClass.bind(view.orders);
      var orders = view.orders.serialize().map(function(order)
      {
        order = {
          order: order,
          visible: view.orders.isVisible(order),
          first: false,
          last: false,
          commentVisible: true,
          rowSpan: 'rowSpan',
          mrpDropped: view.dropZones.getState(order.mrp),
          getChildOrderDropZoneClass: getChildOrderDropZoneClass
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
        orders: orders,
        renderQueueOrder: queueOrderTemplate
      };
    },

    afterRender: function()
    {
      var $focused = this.$order(this.lastFocusedOrder);

      if ($focused.length)
      {
        this.el.parentNode.scrollTop = $focused[0].offsetTop + 1;
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
        this.$el.parent().animate({scrollTop: orderEl.offsetTop + 1}, 200);

        this.lastFocusedOrder = orderId;
      }

      var detailsView = new PaintShopOrderDetailsView({
        model: order,
        orders: this.orders,
        dropZones: this.dropZones,
        height: orderEl ? orderEl.clientHeight : 0,
        vkb: this.options.vkb,
        embedded: this.options.embedded
      });

      viewport.showDialog(detailsView);
    },

    showMenu: function(e)
    {
      if (this.timers.showMenu)
      {
        clearTimeout(this.timers.showMenu);
        this.timers.showMenu = null;
      }

      var order = this.orders.get(e.currentTarget.dataset.orderId);
      var orderNo = order.get('order');
      var mrp = order.get('mrp');
      var menu = [
        order.get('order'),
        {
          icon: 'fa-print',
          label: t('paintShop', 'menu:printOrder'),
          handler: this.trigger.bind(this, 'actionRequested', 'printOrders', 'order', orderNo)
        },
        {
          icon: 'fa-clipboard',
          label: t('paintShop', 'menu:copyOrder'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyOrders', e, orderNo),
          visible: !this.options.embedded
        },
        {
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyChildOrders', e, orderNo),
          visible: !this.options.embedded
        },
        '-',
        t('paintShop', 'menu:header:mrp', {mrp: mrp}),
        {
          icon: 'fa-clipboard',
          label: t('paintShop', 'menu:copyOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyOrders', e, mrp),
          visible: !this.options.embedded
        },
        {
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyChildOrders', e, mrp),
          visible: !this.options.embedded
        },
        {
          icon: 'fa-print',
          label: t('paintShop', 'menu:printOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'printOrders', 'mrp', mrp)
        },
        {
          icon: 'fa-download',
          label: t('paintShop', 'menu:exportOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'exportOrders', mrp),
          visible: !this.options.embedded
        }
      ];

      if (user.isAllowedTo('PAINT_SHOP:DROP_ZONES'))
      {
        menu.push({
          icon: 'fa-level-down',
          label: t('paintShop', 'menu:dropZone:' + this.dropZones.getState(mrp)),
          handler: this.trigger.bind(this, 'actionRequested', 'dropZone', mrp, false)
        });
      }

      menu.push(
        '-',
        t('paintShop', 'menu:header:all'),
        {
          icon: 'fa-clipboard',
          label: t('paintShop', 'menu:copyOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyOrders', e, null),
          visible: !this.options.embedded
        },
        {
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'copyChildOrders', e, null),
          visible: !this.options.embedded
        },
        {
          icon: 'fa-print',
          label: t('paintShop', 'menu:printOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'printOrders', null, null)
        },
        {
          icon: 'fa-download',
          label: t('paintShop', 'menu:exportOrders'),
          handler: this.trigger.bind(this, 'actionRequested', 'exportOrders', null),
          visible: !this.options.embedded
        }
      );

      if (user.isAllowedTo('PAINT_SHOP:DROP_ZONES') && this.orders.selectedPaint !== 'all')
      {
        menu.push({
          icon: 'fa-level-down',
          label: t('paintShop', 'menu:dropZone:' + this.dropZones.getState(this.orders.selectedPaint)),
          handler: this.trigger.bind(this, 'actionRequested', 'dropZone', this.orders.selectedPaint, true)
        });
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    toggleVisibility: function()
    {
      var orders = this.orders;

      this.$('.paintShop-order').each(function()
      {
        var order = orders.get(this.dataset.orderId);
        var hidden = !order || !orders.isVisible(order.serialize());

        this.classList.toggle('hidden', hidden);
        this.classList.toggle('visible', !hidden);
      });

      this.$('.paintShop-order.is-first, .paintShop-order.is-last').removeClass('is-first is-last');

      var $visible = this.$('.visible');

      $visible.first().addClass('is-first');
      $visible.last().addClass('is-last');

      this.el.scrollTop = 0;
    },

    toggleChildOrderDropZones: function()
    {
      var view = this;

      view.$('.paintShop-childOrder-dropZone').each(function()
      {
        this.classList.remove('is-dropped', 'is-undroppable', 'is-droppable');

        var order = view.orders.get(this.dataset.orderId);

        if (!order)
        {
          return;
        }

        order = order.serialize();

        var childOrder = order.childOrders[this.dataset.childOrderIndex];

        if (!childOrder)
        {
          return;
        }

        var dropZoneClass = view.orders.getChildOrderDropZoneClass(childOrder, order);

        if (dropZoneClass)
        {
          this.classList.add(dropZoneClass);
        }
      });
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

      this.lastFocusedOrder = $visible[0].dataset.orderId;

      var scrollTop = parent.scrollTop;

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
      var view = this;
      var $order = view.$order(order.id);
      var orderData = order.serialize();

      $order.replaceWith(queueOrderTemplate({
        order: orderData,
        visible: view.orders.isVisible(orderData),
        first: $order.hasClass('is-first'),
        last: $order.hasClass('is-last'),
        commentVisible: true,
        rowSpan: 'rowSpan',
        mrpDropped: view.dropZones.getState(orderData.mrp),
        getChildOrderDropZoneClass: view.orders.getChildOrderDropZoneClass.bind(view.orders)
      }));
    },

    onFocus: function(orderId, options)
    {
      var orderEl = this.$order(orderId)[0];

      if (orderEl)
      {
        if (orderEl.classList.contains('hidden'))
        {
          this.orders.selectMrp(orderEl.dataset.mrp);
        }

        this.$el.parent().animate({scrollTop: orderEl.offsetTop + 1}, 200);

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

    onDropZoneUpdated: function(dropZone)
    {
      var mrpOrPaint = dropZone.get('mrp');
      var state = dropZone.get('state');
      var $mrp = this.$('.paintShop-property-mrp[data-mrp="' + mrpOrPaint + '"]');

      if ($mrp.length)
      {
        $mrp.toggleClass('is-dropped', state);
      }
      else
      {
        this.toggleChildOrderDropZones();
      }
    }

  });
});
