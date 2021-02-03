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
  '../PlanOrderCollection',
  './PlanOrderQuantityDialogView',
  './PlanOrderLinesDialogView',
  './PlanOrderAddDialogView',
  './PlanOrderDropZoneDialogView',
  'app/planning/templates/orders',
  'app/planning/templates/orderPopover',
  'app/planning/templates/orderIgnoreDialog',
  'app/planning/templates/orderRemoveDialog',
  'app/planning/templates/orderStatusIcons'
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
  PlanOrderCollection,
  PlanOrderQuantityDialogView,
  PlanOrderLinesDialogView,
  PlanOrderAddDialogView,
  PlanOrderDropZoneDialogView,
  ordersTemplate,
  orderPopoverTemplate,
  orderIgnoreDialogTemplate,
  orderRemoveDialogTemplate,
  orderStatusIconsTemplate
) {
  'use strict';

  return View.extend({

    template: ordersTemplate,

    modelProperty: 'plan',

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
            window.open('/#orders/' + orderNo);

            return;
          }

          if (window.getSelection().toString() === '')
          {
            this.mrp.orders.trigger('preview', {
              orderNo: orderNo,
              source: 'orders'
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
      view.listenTo(plan.settings, 'changed', view.onSettingsChanged);
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

    getTemplateData: function()
    {
      return {
        showEditButton: this.isEditable() && this.plan.settings.getVersion() === 1,
        actionLabel: this.t('orders:add'),
        hdLabel: this.t('orders:hd'),
        orders: this.serializeOrders(),
        icons: true
      };
    },

    serializeOrders: function()
    {
      var plan = this.plan;

      return this.mrp.orders.map(function(order)
      {
        var orderData = plan.getActualOrderData(order.id);
        var sapStatuses = order.mapSapStatuses(orderData.statuses);

        return {
          _id: order.id,
          mrp: order.get('mrp'),
          incomplete: order.get('incomplete') > 0 ? 'is-incomplete' : '',
          completed: orderData.quantityDone >= orderData.quantityTodo ? 'is-completed' : '',
          started: orderData.quantityDone > 0 ? 'is-started' : '',
          surplus: orderData.quantityDone > orderData.quantityTodo ? 'is-surplus' : '',
          unplanned: order.get('incomplete') === order.getQuantityTodo() ? 'is-unplanned' : '',
          confirmed: sapStatuses.CNF ? 'is-cnf' : '',
          delivered: sapStatuses.DLV ? 'is-dlv' : '',
          deleted: sapStatuses.deleted ? 'is-teco' : '',
          ignored: order.get('ignored') ? 'is-ignored' : '',
          invalid: !order.get('operation').laborTime ? 'is-invalid' : '',
          statusIcons: orderStatusIconsTemplate(plan, order.id, {sapStatuses: false})
        };
      }).sort(PlanOrderCollection.compare);
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

          return view.serializePopover(this.dataset.id, true);
        },
        template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      });

      if (view.$preview)
      {
        var previewedOrderNo = view.$preview.data('orderNo');

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

      if (!$action.length)
      {
        return;
      }

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

    serializePopover: function(id, comment)
    {
      var planOrder = this.plan.orders.get(id);

      if (!planOrder)
      {
        return null;
      }

      var sapOrder = this.plan.sapOrders.get(planOrder.id);
      var orderData = this.plan.getActualOrderData(planOrder.id);
      var operation = planOrder.get('operation');

      return orderPopoverTemplate({
        order: {
          _id: planOrder.id,
          date: planOrder.get('date') === this.plan.id ? null : time.utc.format(planOrder.get('date'), 'LL'),
          nc12: planOrder.get('nc12'),
          name: planOrder.get('name'),
          kind: planOrder.get('kind'),
          incomplete: planOrder.get('incomplete'),
          completed: orderData.quantityDone >= orderData.quantityTodo,
          surplus: orderData.quantityDone > orderData.quantityTodo,
          quantityTodo: orderData.quantityTodo,
          quantityDone: orderData.quantityDone,
          quantityPlan: planOrder.get('quantityPlan'),
          ignored: planOrder.get('ignored'),
          statuses: orderData.statuses.map(renderOrderStatusLabel),
          manHours: planOrder.get('manHours'),
          laborTime: operation && operation.laborTime ? operation.laborTime : 0,
          lines: planOrder.get('lines') || [],
          comment: comment && sapOrder ? sapOrder.getCommentWithIcon() : ''
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

    showPreview: function(order, showComment)
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
        content: view.serializePopover(order.id, showComment !== false),
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

      viewport.showDialog(dialogView, this.t('orders:add:title'));
    },

    isEditable: function()
    {
      if (window.ENV !== 'production' && user.isAllowedTo('SUPER'))
      {
        return true;
      }

      return this.plan.canEditSettings() && !this.plan.settings.isMrpLocked(this.mrp.id);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var version = this.plan.settings.getVersion();
      var planOrder = this.mrp.orders.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [
        contextMenu.actions.sapOrder(planOrder.id)
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW')
        && (this.plan.shiftOrders.findOrders(planOrder.id).length
        || this.plan.getActualOrderData(planOrder.id).quantityDone))
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: this.t('orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, planOrder)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.commentPopover(planOrder.id));
      }

      if (this.isEditable() && !planOrder.isAutoAdded())
      {
        menu.push({
          icon: 'fa-sort-numeric-desc',
          label: this.t('orders:menu:quantity'),
          handler: this.handleQuantityAction.bind(this, planOrder),
          visible: version === 1
        },
        {
          icon: 'fa-thumb-tack',
          label: this.t('orders:menu:lines'),
          handler: this.handleLinesAction.bind(this, planOrder),
          visible: version === 1
        },
        {
          icon: 'fa-exclamation',
          label: this.t('orders:menu:' + (planOrder.get('urgent') ? 'unurgent' : 'urgent')),
          handler: this.handleUrgentAction.bind(this, planOrder),
          visible: version === 1
        },
        {
          icon: 'fa-ban',
          label: this.t('orders:menu:' + (planOrder.get('ignored') ? 'unignore' : 'ignore')),
          handler: this.handleIgnoreAction.bind(this, planOrder),
          visible: version === 1
        });

        if (planOrder.get('source') === 'added')
        {
          menu.push({
            icon: 'fa-times',
            label: this.t('orders:menu:remove'),
            handler: this.handleRemoveAction.bind(this, planOrder)
          });
        }
      }

      if (this.plan.canChangeDropZone())
      {
        menu.push({
          icon: 'fa-level-down',
          label: this.t('orders:menu:dropZone'),
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
        url += '?sort(startedAt)&limit(-1337)&orderId=string:' + planOrder.id;
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

      viewport.showDialog(dialogView, this.t('orders:menu:quantity:title'));
    },

    handleLinesAction: function(planOrder)
    {
      var dialogView = new PlanOrderLinesDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: planOrder
      });

      viewport.showDialog(dialogView, this.t('orders:menu:lines:title'));
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
            text: view.t('orders:menu:urgent:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, view.t('orders:menu:urgent:title'));
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
            text: view.t('orders:menu:ignore:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, view.t('orders:menu:ignore:title'));
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
            text: view.t('orders:menu:remove:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, view.t('orders:menu:remove:title'));
    },

    handleDropZoneAction: function(planOrder)
    {
      var dialogView = new PlanOrderDropZoneDialogView({
        plan: this.plan,
        mrp: this.mrp,
        order: planOrder
      });

      viewport.showDialog(dialogView, this.t('orders:menu:dropZone:title'));
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
      this.$('.is-highlighted').removeClass('is-highlighted');

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
        this.showPreview(order, message.source !== 'lineOrders');
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
          .attr('title', this.t('orders:psStatus:' + psStatus))
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
          .attr('title', this.t('orders:whStatus:' + whStatus))
          .attr('data-wh-status', whStatus);
      }
    },

    onSettingsChanged: function(changes)
    {
      if (changes.locked)
      {
        this.render();
      }
    }

  });
});
