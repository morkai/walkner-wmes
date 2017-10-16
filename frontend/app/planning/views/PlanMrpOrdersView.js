// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/time',
  'app/core/View',
  'app/core/views/DialogView',
  'app/orderStatuses/util/renderOrderStatusLabel',
  '../util/scrollIntoView',
  '../util/contextMenu',
  './PlanOrderQuantityDialogView',
  './PlanOrderAddDialogView',
  'app/planning/templates/orders',
  'app/planning/templates/orderPopover',
  'app/planning/templates/orderIgnoreDialog',
  'app/planning/templates/orderRemoveDialog'
], function(
  _,
  $,
  t,
  viewport,
  user,
  time,
  View,
  DialogView,
  renderOrderStatusLabel,
  scrollIntoView,
  contextMenu,
  PlanOrderQuantityDialogView,
  PlanOrderAddDialogView,
  ordersTemplate,
  orderPopoverTemplate,
  orderIgnoreDialogTemplate,
  orderRemoveDialogTemplate
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
      },
      'click .is-order': function(e)
      {
        if (e.button === 0)
        {
          var orderNo = e.currentTarget.dataset.id;

          if (e.ctrlKey)
          {
            window.open('#orders/' + orderNo);

            return;
          }

          this.mrp.orders.trigger('preview', {
            orderNo: orderNo
          });
        }
      },
      'contextmenu .is-order': function(e)
      {
        this.showMenu(e);

        return false;
      },
      'click #-add': function()
      {
        this.$id('add').blur();

        this.hidePreview();
        this.showAddDialog();

        return false;
      }
    },

    localTopics: {
      'planning.windowResized': 'resize',
      'planning.escapePressed': function()
      {
        this.hidePreview();
        this.hideMenu();
      },
      'planning.contextMenu.shown': 'hidePreview'
    },

    initialize: function()
    {
      var view = this;
      var mrp = view.mrp;
      var plan = view.plan;

      view.$preview = null;

      view.listenTo(mrp.orders, 'added changed', view.onOrdersChanged);
      view.listenTo(mrp.orders, 'removed', view.onOrdersRemoved);
      view.listenTo(mrp.orders, 'highlight', view.onOrderHighlight);
      view.listenTo(mrp.orders, 'preview', view.onOrderPreview);
      view.listenTo(plan.displayOptions, 'change:useLatestOrderData', view.render);
      view.listenTo(plan.sapOrders, 'reset', view.onSapOrdersReset);
    },

    destroy: function()
    {
      this.hideMenu();

      if (this.$preview)
      {
        this.$preview.popover('destroy');
        this.$preview = null;
      }

      this.$el.popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showEditButton: this.plan.canEditSettings(),
        hdLabel: t('planning', 'orders:hd'),
        orders: this.serializeOrders()
      };
    },

    serializeOrders: function()
    {
      var plan = this.plan;

      return this.mrp.orders.map(function(order)
      {
        var orderData = plan.getActualOrderData(order.id);
        var added = order.get('added');
        var urgent = order.get('urgent');
        var customQuantity = order.get('quantityPlan') > 0;
        var late = order.isContinuation();

        return {
          _id: order.id,
          kind: order.get('kind'),
          incomplete: order.get('incomplete') > 0,
          completed: orderData.quantityDone >= orderData.quantityTodo,
          surplus: orderData.quantityDone > orderData.quantityTodo,
          invalid: false,
          added: added,
          ignored: order.get('ignored'),
          confirmed: orderData.statuses.indexOf('CNF') !== -1,
          delivered: orderData.statuses.indexOf('DLV') !== -1,
          customQuantity: customQuantity && !late,
          urgent: urgent && !late,
          late: late
        };
      });
    },

    afterRender: function()
    {
      var view = this;

      view.$el.popover({
        container: view.el,
        selector: '.planning-mrp-list-item',
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: function()
        {
          if (view.$preview && view.$preview.data('orderNo') === this.dataset.id)
          {
            return;
          }

          return view.serializePopover(this.dataset.id);
        },
        template: '<div class="popover planning-mrp-popover">'
        + '<div class="arrow"></div>'
        + '<div class="popover-content"></div>'
        + '</div>'
      });

      if (view.$popover)
      {
        var previewedOrderNo = view.$popover.data('orderNo');

        view.hidePreview();
        view.showPreview(previewedOrderNo);
      }

      view.$id('list').on('scroll', function(e)
      {
        view.$id('scrollIndicator').toggleClass('hidden', e.target.scrollLeft <= 40);
        view.hidePreview();
      });

      view.resize();
    },

    resize: function()
    {
      var $action = this.$('.planning-mrp-list-action');
      var $scrollIndicator = this.$id('scrollIndicator');
      var pos = $action.position();

      $scrollIndicator.css({
        top: (pos.top + 1) + 'px',
        left: ($action.outerWidth() + pos.left) + 'px'
      });

      if (this.$preview)
      {
        this.$preview.popover('show');
      }

      contextMenu.hide(this);
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
          date: order.get('date') === this.plan.id ? null : time.utc.format(order.get('date'), 'LL'),
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

    hidePreview: function()
    {
      if (this.$preview)
      {
        this.$preview.popover('hide');
        this.$preview = null;
      }
    },

    showPreview: function(order)
    {
      var view = this;

      view.$preview = view.$item(order.id).find('.planning-mrp-list-item-inner').data('orderNo', order.id).popover({
        container: view.el,
        trigger: 'manual',
        placement: 'top',
        html: true,
        content: view.serializePopover(order.id),
        template: '<div class="popover planning-mrp-popover planning-mrp-popover-preview">'
        + '<div class="arrow"></div>'
        + '<div class="popover-content"></div>'
        + '</div>'
      });

      view.$preview.one('hidden.bs.popover', function()
      {
        if (view.$preview && view.$preview.data('orderNo') === order.id)
        {
          view.$preview.popover('destroy');
          view.$preview = null;
        }
      });

      view.$preview.data('bs.popover').tip().on('click', function()
      {
        if (window.getSelection().toString() === '')
        {
          view.hidePreview();
        }
      });

      view.$preview.popover('show');
    },

    showAddDialog: function()
    {
      var dialogView = new PlanOrderAddDialogView({
        plan: this.plan,
        mrp: this.mrp,
        model: {
          orderNo: ''
        }
      });

      viewport.showDialog(dialogView, t('planning', 'orders:add:title'));
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var order = this.mrp.orders.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [
        {
          label: t('planning', 'orders:menu:details'),
          handler: this.handleDetailsAction.bind(this, order)
        }
      ];

      if (this.plan.canEditSettings() && !order.isContinuation())
      {
        menu.push({
          label: t('planning', 'orders:menu:quantity'),
          handler: this.handleQuantityAction.bind(this, order)
        },
        {
          label: t('planning', 'orders:menu:' + (order.get('ignored') ? 'unignore' : 'ignore')),
          handler: this.handleIgnoreAction.bind(this, order)
        });

        if (order.get('added'))
        {
          menu.push({
            label: t('planning', 'orders:menu:remove'),
            handler: this.handleRemoveAction.bind(this, order)
          });
        }
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleDetailsAction: function(order)
    {
      window.open('#orders/' + order.id);
    },

    handleQuantityAction: function(order)
    {
      var dialogView = new PlanOrderQuantityDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: order
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:quantity:title'));
    },

    handleIgnoreAction: function(order)
    {
      var view = this;
      var dialogView = new DialogView({
        autoHide: false,
        template: orderIgnoreDialogTemplate,
        model: {
          action: order.get('ignored') ? 'unignore' : 'ignore',
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          order: order.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var req = view.ajax({
          method: 'PATCH',
          url: '/planning/plans/' + view.plan.id + '/orders/' + order.id,
          data: JSON.stringify({
            ignored: !order.get('ignored')
          })
        });

        req.done(dialogView.closeDialog);
        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('planning', 'orders:menu:ignore:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:ignore:title'));
    },

    handleRemoveAction: function(order)
    {
      var view = this;
      var dialogView = new DialogView({
        autoHide: false,
        template: orderRemoveDialogTemplate,
        model: {
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          order: order.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var req = view.ajax({
          method: 'DELETE',
          url: '/planning/plans/' + view.plan.id + '/orders/' + order.id
        });

        req.done(dialogView.closeDialog);
        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('planning', 'orders:menu:remove:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:remove:title'));
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
      var $item = this.$('.is-order[data-id="' + message.orderNo + '"]').toggleClass('is-highlighted', message.state);

      if (message.source !== 'orders' && !this.plan.displayOptions.isListWrappingEnabled())
      {
        this.hidePreview();

        scrollIntoView($item[0]);
      }
    },

    onOrderPreview: function(message)
    {
      var order = this.mrp.orders.get(message.orderNo);

      if (!order)
      {
        return;
      }

      if (this.$preview)
      {
        var previewedOrderNo = this.$preview.data('orderNo');

        this.hidePreview();

        if (order.id === previewedOrderNo)
        {
          return;
        }
      }

      if (message.scrollIntoView)
      {
        var scrollTop = this.$el.position().top - 180;

        $('html, body').animate({scrollTop: scrollTop}, 'fast', 'swing', this.showPreview.bind(this, order));
      }
      else
      {
        this.showPreview(order);
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
