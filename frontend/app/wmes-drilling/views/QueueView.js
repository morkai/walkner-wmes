// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/planning/util/contextMenu',
  './OrderDetailsView',
  'app/wmes-drilling/templates/queue',
  'app/wmes-drilling/templates/queueOrder'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  contextMenu,
  OrderDetailsView,
  queueTemplate,
  queueOrderTemplate
) {
  'use strict';

  return View.extend({

    template: queueTemplate,

    modelProperty: 'orders',

    events: {
      'mousedown .drilling-order': function(e)
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
      'mouseup .drilling-order': function(e)
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
      this.listenTo(this.orders, 'mrpSelected', this.toggleVisibility);
    },

    getTemplateData: function()
    {
      var view = this;
      var first = null;
      var last = null;
      var orders = view.orders.serialize().map(function(order)
      {
        order = {
          order: order,
          visible: view.orders.isVisible(order),
          first: false,
          last: false,
          commentVisible: true,
          rowSpan: 'rowSpan',
          view: 'queue'
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
        renderQueueOrder: this.renderPartialHtml.bind(this, queueOrderTemplate)
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
      return this.$('.drilling-order[data-order-id="' + orderId + '"]');
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

      var detailsView = new OrderDetailsView({
        model: order,
        orders: this.orders,
        height: orderEl ? orderEl.clientHeight : 0,
        vkb: this.options.vkb,
        embedded: this.options.embedded
      });

      viewport.showDialog(detailsView);
    },

    showMenu: function(e)
    {
      var view = this;

      if (view.timers.showMenu)
      {
        clearTimeout(view.timers.showMenu);
        view.timers.showMenu = null;
      }

      var order = view.orders.get(e.currentTarget.dataset.orderId);

      if (!order)
      {
        return;
      }

      var orderNo = order.get('order');
      var mrp = order.get('mrp');
      var menu = [order.get('order')];

      if (user.can.viewOrders())
      {
        menu.push({
          icon: 'fa-file-o',
          label: view.t('menu:openOrder', {orderNo: 'parent'}),
          handler: view.trigger.bind(view, 'actionRequested', 'openOrder', {
            orderNo: orderNo
          })
        });

        order.get('childOrders').forEach(function(childOrder)
        {
          if (childOrder.order === orderNo)
          {
            return;
          }

          menu.push({
            label: view.t('menu:openOrder', {orderNo: childOrder.order}),
            handler: view.trigger.bind(view, 'actionRequested', 'openOrder', {
              orderNo: childOrder.order
            })
          });
        });
      }

      menu.push(
        {
          icon: 'fa-print',
          label: view.t('menu:printOrder'),
          handler: view.trigger.bind(view, 'actionRequested', 'printOrders', {
            filterProperty: 'order',
            filterValue: orderNo
          })
        },
        {
          icon: 'fa-clipboard',
          label: view.t('menu:copyOrder'),
          handler: view.trigger.bind(view, 'actionRequested', 'copyOrders', e, {
            filterProperty: 'order',
            filterValue: orderNo
          }),
          visible: !view.options.embedded
        },
        {
          label: view.t('menu:copyChildOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'copyChildOrders', e, {
            filterProperty: 'order',
            filterValue: orderNo
          }),
          visible: !view.options.embedded
        },
        '-',
        view.t('menu:header:mrp', {mrp: mrp}),
        {
          icon: 'fa-print',
          label: view.t('menu:printOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'printOrders', {
            filterProperty: 'mrp',
            filterValue: mrp
          })
        },
        {
          icon: 'fa-clipboard',
          label: view.t('menu:copyOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'copyOrders', e, {
            filterProperty: 'mrp',
            filterValue: mrp
          }),
          visible: !view.options.embedded
        },
        {
          label: view.t('menu:copyChildOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'copyChildOrders', e, {
            filterProperty: 'mrp',
            filterValue: mrp
          }),
          visible: !view.options.embedded
        },
        {
          icon: 'fa-download',
          label: view.t('menu:exportOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'exportOrders', {
            filterProperty: 'mrp',
            filterValue: mrp
          }),
          visible: !view.options.embedded
        }
      );

      menu.push(
        '-',
        view.t('menu:header:all'),
        {
          icon: 'fa-print',
          label: view.t('menu:printOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'printOrders', {
            filterProperty: null,
            filterValue: null
          })
        },
        {
          icon: 'fa-clipboard',
          label: view.t('menu:copyOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'copyOrders', e, {
            filterProperty: null,
            filterValue: null
          }),
          visible: !view.options.embedded
        },
        {
          label: view.t('menu:copyChildOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'copyChildOrders', e, {
            filterProperty: null,
            filterValue: null
          }),
          visible: !view.options.embedded
        },
        {
          icon: 'fa-download',
          label: view.t('menu:exportOrders'),
          handler: view.trigger.bind(view, 'actionRequested', 'exportOrders', {
            filterProperty: null,
            filterValue: null
          }),
          visible: !view.options.embedded
        }
      );

      contextMenu.show(view, e.pageY, e.pageX, menu);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    toggleVisibility: function()
    {
      var orders = this.orders;

      this.$('.drilling-order').each(function()
      {
        var order = orders.get(this.dataset.orderId);
        var hidden = !order || !orders.isVisible(order.serialize());

        this.classList.toggle('hidden', hidden);
        this.classList.toggle('visible', !hidden);
      });

      this.$('.drilling-order.is-first, .drilling-order.is-last').removeClass('is-first is-last');

      var $visible = this.$('.visible');

      $visible.first().addClass('is-first');
      $visible.last().addClass('is-last');

      this.el.scrollTop = 0;
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
        view: 'queue'
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
    }

  });
});
