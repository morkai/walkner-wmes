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
            window.open('#orders/' + orderNo);
          }
        }
      },
      'contextmenu .is-order': function(e)
      {
        this.showMenu(e);

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
    },

    destroy: function()
    {
      this.hideMenu();

      this.$el.popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showEditButton: false,
        hdLabel: t('planning', 'lateOrders:hd'),
        orders: this.serializeOrders()
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
            incomplete: false,
            completed: false,
            surplus: false,
            invalid: false,
            ignored: false,
            confirmed: false,
            delivered: false,
            customQuantity: false,
            urgent: false,
            late: false
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
      var $scrollIndicator = this.$id('scrollIndicator');
      var pos = $action.position();

      $scrollIndicator.css({
        top: (pos.top + 1) + 'px',
        left: ($action.outerWidth() + pos.left) + 'px'
      });

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
          laborTime: operation && operation.laborTime ? operation.laborTime : 0
        }
      });
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var order = this.plan.lateOrders.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [
        {
          label: t('planning', 'orders:menu:sapOrder'),
          handler: this.handleSapOrderAction.bind(this, order)
        }
      ];

      if (this.plan.isEditable() && user.isAllowedTo('PLANNING:PLANNER', 'PLANNING:MANAGE'))
      {
        menu.push({
          label: t('planning', 'orders:menu:add'),
          handler: this.handleAddAction.bind(this, order)
        });
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleDetailsAction: function(order)
    {
      window.open('#orders/' + order.id);
    },

    handleAddAction: function(order)
    {
      var dialogView = new PlanOrderAddDialogView({
        plan: this.plan,
        mrp: this.mrp,
        model: {
          orderNo: order.id
        }
      });

      viewport.showDialog(dialogView, t('planning', 'orders:add:title'));
    }

  });
});
