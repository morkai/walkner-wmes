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
  './PlanOrderLinesDialogView',
  './PlanOrderAddDialogView',
  './PlanOrderDropZoneDialogView',
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
  PlanOrderLinesDialogView,
  PlanOrderAddDialogView,
  PlanOrderDropZoneDialogView,
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

          if (window.getSelection().toString() === '')
          {
            this.mrp.orders.trigger('preview', {
              orderNo: orderNo
            });
          }
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
      view.listenTo(plan.sapOrders, 'change:psStatus', view.onPsStatusChanged);
      view.listenTo(plan.sapOrders, 'change:whStatus', view.onWhStatusChanged);
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
        orders: this.serializeOrders(),
        icons: true
      };
    },

    serializeOrders: function()
    {
      var plan = this.plan;

      return this.mrp.orders.sort().map(function(order)
      {
        var orderData = plan.getActualOrderData(order.id);
        var source = order.get('source');
        var urgent = order.get('urgent');
        var autoAdded = order.isAutoAdded();

        return {
          _id: order.id,
          kind: order.get('kind'),
          kindIcon: order.getKindIcon(),
          incomplete: order.get('incomplete') > 0 ? 'is-incomplete' : '',
          completed: orderData.quantityDone >= orderData.quantityTodo ? 'is-completed' : '',
          started: orderData.quantityDone > 0 ? 'is-started' : '',
          surplus: orderData.quantityDone > orderData.quantityTodo ? 'is-surplus' : '',
          unplanned: order.get('incomplete') === order.getQuantityTodo() ? 'is-unplanned' : '',
          source: source,
          confirmed: orderData.statuses.indexOf('CNF') !== -1 ? 'is-cnf' : '',
          delivered: orderData.statuses.indexOf('DLV') !== -1 ? 'is-dlv' : '',
          customQuantity: order.hasCustomQuantity(),
          ignored: order.get('ignored') ? 'is-ignored' : '',
          urgent: urgent && !autoAdded,
          invalid: !order.get('operation').laborTime ? 'is-invalid' : '',
          pinned: order.isPinned(),
          psStatus: plan.sapOrders.getPsStatus(order.id),
          whStatus: plan.sapOrders.getWhStatus(order.id)
        };
      });
    },

    beforeRender: function()
    {
      if (this.$preview)
      {
        this.$preview.popover('destroy');
        this.$preview = null;
      }
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
          laborTime: operation && operation.laborTime ? operation.laborTime : 0,
          lines: order.get('lines') || []
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

      if (!view.mrp.orders.get(order.id))
      {
        return;
      }

      view.$preview = view.$item(order.id).find('.planning-mrp-list-item-inner').data('orderNo', order.id).popover({
        container: view.el,
        trigger: 'manual',
        placement: 'top',
        html: true,
        hasContent: true,
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
      var planOrder = this.mrp.orders.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [
        contextMenu.actions.sapOrder(planOrder.id)
      ];

      if (this.plan.shiftOrders.findOrders(planOrder.id).length
        || this.plan.getActualOrderData(planOrder.id).quantityDone)
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: t('planning', 'orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, planOrder)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.comment(planOrder.id));
      }

      if (this.plan.canEditSettings() && !planOrder.isAutoAdded())
      {
        menu.push({
          icon: 'fa-sort-numeric-desc',
          label: t('planning', 'orders:menu:quantity'),
          handler: this.handleQuantityAction.bind(this, planOrder)
        },
        {
          icon: 'fa-thumb-tack',
          label: t('planning', 'orders:menu:lines'),
          handler: this.handleLinesAction.bind(this, planOrder)
        },
        {
          icon: 'fa-exclamation',
          label: t('planning', 'orders:menu:' + (planOrder.get('urgent') ? 'unurgent' : 'urgent')),
          handler: this.handleUrgentAction.bind(this, planOrder)
        },
        {
          icon: 'fa-ban',
          label: t('planning', 'orders:menu:' + (planOrder.get('ignored') ? 'unignore' : 'ignore')),
          handler: this.handleIgnoreAction.bind(this, planOrder)
        });

        if (planOrder.get('source') === 'added')
        {
          menu.push({
            icon: 'fa-times',
            label: t('planning', 'orders:menu:remove'),
            handler: this.handleRemoveAction.bind(this, planOrder)
          });
        }
      }

      if (this.plan.canChangeDropZone())
      {
        menu.push({
          icon: 'fa-level-down',
          label: t('planning', 'orders:menu:dropZone'),
          handler: this.handleDropZoneAction.bind(this, planOrder)
        });
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleShiftOrderAction: function(planOrder)
    {
      var planShiftOrders = this.plan.shiftOrders.findOrders(planOrder.id);
      var url = '/#prodShiftOrders';

      if (planShiftOrders.length === 1)
      {
        url += '/' + planShiftOrders[0].id;
      }
      else
      {
        url += '?sort(startedAt)&limit(20)&orderId=' + planOrder.id;
      }

      window.open(url);
    },

    handleQuantityAction: function(planOrder)
    {
      var dialogView = new PlanOrderQuantityDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: planOrder
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:quantity:title'));
    },

    handleLinesAction: function(planOrder)
    {
      var dialogView = new PlanOrderLinesDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: planOrder
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:lines:title'));
    },

    handleUrgentAction: function(planOrder)
    {
      var view = this;
      var urgent = planOrder.get('urgent');
      var dialogView = new DialogView({
        autoHide: false,
        template: orderIgnoreDialogTemplate,
        model: {
          action: urgent ? 'unurgent' : 'urgent',
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          order: planOrder.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var req = view.ajax({
          method: 'PATCH',
          url: '/planning/plans/' + view.plan.id + '/orders/' + planOrder.id,
          data: JSON.stringify({
            urgent: !urgent
          })
        });

        req.done(dialogView.closeDialog);
        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('planning', 'orders:menu:urgent:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:urgent:title'));
    },

    handleIgnoreAction: function(planOrder)
    {
      var view = this;
      var dialogView = new DialogView({
        autoHide: false,
        template: orderIgnoreDialogTemplate,
        model: {
          action: planOrder.get('ignored') ? 'unignore' : 'ignore',
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          order: planOrder.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var req = view.ajax({
          method: 'PATCH',
          url: '/planning/plans/' + view.plan.id + '/orders/' + planOrder.id,
          data: JSON.stringify({
            ignored: !planOrder.get('ignored')
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

    handleRemoveAction: function(planOrder)
    {
      var view = this;
      var dialogView = new DialogView({
        autoHide: false,
        template: orderRemoveDialogTemplate,
        model: {
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          order: planOrder.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var req = view.ajax({
          method: 'DELETE',
          url: '/planning/plans/' + view.plan.id + '/orders/' + planOrder.id
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

    handleDropZoneAction: function(planOrder)
    {
      var dialogView = new PlanOrderDropZoneDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: planOrder
      });

      viewport.showDialog(dialogView, t('planning', 'orders:menu:dropZone:title'));
    },

    onOrdersChanged: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
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
      if (!options.reload && this.plan.displayOptions.isLatestOrderDataUsed() && !this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    onPsStatusChanged: function(sapOrder)
    {
      var $order = this.$item(sapOrder.id);

      if ($order.length)
      {
        var psStatus = this.plan.sapOrders.getPsStatus(sapOrder.id);

        $order
          .find('.planning-mrp-list-property-psStatus')
          .attr('title', t('planning', 'orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    },

    onWhStatusChanged: function(sapOrder)
    {
      var $order = this.$item(sapOrder.id);

      if ($order.length)
      {
        var whStatus = this.plan.sapOrders.getWhStatus(sapOrder.id);

        $order
          .find('.planning-mrp-list-property-whStatus')
          .attr('title', t('planning', 'orders:whStatus:' + whStatus))
          .attr('data-wh-status', whStatus);
      }
    }

  });
});
