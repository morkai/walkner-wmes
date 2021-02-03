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
  './PlanOrderAddDialogView',
  './PlanLateOrderAddDialogView',
  'app/planning/templates/orders',
  'app/planning/templates/orderPopover'
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
  PlanOrderAddDialogView,
  PlanLateOrderAddDialogView,
  ordersTemplate,
  orderPopoverTemplate
) {
  'use strict';

  return View.extend({

    template: ordersTemplate,

    events: {
      'click .is-order': function(e)
      {
        if (e.button === 0)
        {
          var orderNo = e.currentTarget.dataset.id;

          if (e.ctrlKey)
          {
            window.open('/#orders/' + orderNo);
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

        this.showAddDialog();

        return false;
      }
    },

    localTopics: {
      'planning.windowResized': 'resize',
      'planning.escapePressed': function()
      {
        this.hideMenu();
      }
    },

    initialize: function()
    {
      var view = this;
      var mrp = view.mrp;
      var plan = view.plan;

      view.listenTo(mrp.orders, 'added removed reset', view.render);
      view.listenTo(plan.lateOrders, 'reset', view.render);
      view.listenTo(plan.settings, 'changed', view.onSettingsChanged);
    },

    destroy: function()
    {
      this.hideMenu();

      this.$el.popover('destroy');
    },

    getTemplateData: function()
    {
      return {
        showEditButton: this.isEditable(),
        actionLabel: t('planning', 'lateOrders:action'),
        hdLabel: t('planning', 'lateOrders:hd'),
        orders: this.serializeOrders(),
        icons: false
      };
    },

    serializeOrders: function()
    {
      var plan = this.plan;
      var mrp = this.mrp;

      return plan.lateOrders
        .filter(function(order)
        {
          return order.get('mrp') === mrp.id && !mrp.orders.get(order.id);
        })
        .map(function(order)
        {
          return {
            _id: order.id,
            kind: null,
            incomplete: '',
            completed: '',
            started: '',
            surplus: '',
            invalid: '',
            added: false,
            ignored: '',
            confirmed: '',
            delivered: '',
            customQuantity: false,
            urgent: false,
            late: false,
            pinned: false,
            psStatus: 'unknown',
            whStatus: 'unknown'
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
        hasContent: true,
        content: function() { return view.serializePopover(this.dataset.id); },
        template: '<div class="popover planning-mrp-popover">'
        + '<div class="arrow"></div>'
        + '<div class="popover-content"></div>'
        + '</div>'
      });

      view.$id('list').on('scroll', function(e)
      {
        view.$id('scrollIndicator').toggleClass('hidden', e.target.scrollLeft <= 40);
      });

      view.resize();
    },

    resize: function()
    {
      var $action = this.$('.planning-mrp-list-action').first();

      if ($action.length)
      {
        var $scrollIndicator = this.$id('scrollIndicator');
        var pos = $action.position();

        $scrollIndicator.css({
          top: (pos.top + 1) + 'px',
          left: ($action.outerWidth() + pos.left) + 'px'
        });
      }

      contextMenu.hide(this);
    },

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializePopover: function(id)
    {
      var order = this.plan.lateOrders.get(id);

      if (!order)
      {
        return '?';
      }

      var delayReason = this.delayReasons.get(order.get('delayReason'));
      var operation = order.get('operation');

      return orderPopoverTemplate({
        order: {
          _id: order.id,
          nc12: order.get('nc12'),
          name: order.get('name'),
          date: time.format(order.get('date'), 'LL'),
          quantityTodo: order.get('quantityTodo'),
          quantityDone: order.get('quantityDone'),
          statuses: order.get('statuses').map(renderOrderStatusLabel),
          delayReason: delayReason ? delayReason.getLabel() : null,
          manHours: order.get('manHours'),
          laborTime: operation && operation.laborTime ? operation.laborTime : 0,
          lines: []
        }
      });
    },

    showAddDialog: function()
    {
      var dialogView = new PlanLateOrderAddDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, t('planning', 'lateOrders:add:title'));
    },

    isEditable: function()
    {
      if (window.ENV !== 'production' && user.isAllowedTo('SUPER'))
      {
        return true;
      }

      return this.plan.canAddLateOrders() && !this.plan.settings.isMrpLocked(this.mrp.id);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var lateOrder = this.plan.lateOrders.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [
        contextMenu.actions.sapOrder(lateOrder.id)
      ];

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.commentPopover(lateOrder.id));
      }

      if (this.isEditable())
      {
        menu.push({
          icon: 'fa-plus',
          label: t('planning', 'orders:menu:add'),
          handler: this.handleAddAction.bind(this, lateOrder)
        });
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleAddAction: function(lateOrder)
    {
      var dialogView = new PlanOrderAddDialogView({
        plan: this.plan,
        mrp: this.mrp,
        model: {
          orderNo: lateOrder.id,
          urgent: true
        }
      });

      viewport.showDialog(dialogView, t('planning', 'orders:add:title'));
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
