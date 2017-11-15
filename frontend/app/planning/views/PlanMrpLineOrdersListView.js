// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  '../util/shift',
  '../util/contextMenu',
  'app/planning/templates/lineOrdersList'
], function(
  _,
  $,
  t,
  time,
  View,
  shiftUtil,
  contextMenu,
  lineOrdersListTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersListTemplate,

    events: {
      'mouseenter tr': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: true,
          orderNo: e.currentTarget.dataset.id
        });
      },
      'mouseleave tr': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: false,
          orderNo: e.currentTarget.dataset.id
        });
      },
      'contextmenu tr': function(e)
      {
        this.showMenu(e);

        return false;
      },
      'dblclick tr': function(e)
      {
        window.getSelection().removeAllRanges();

        var trEl = e.currentTarget;
        var index = trEl.dataset.index;
        var offset = e.clientY - e.currentTarget.getBoundingClientRect().top;

        this.$el.toggleClass('is-expanded');

        if (this.$el.hasClass('is-expanded'))
        {
          window.scrollTo(0, window.scrollY + trEl.getBoundingClientRect().top - e.clientY + offset);
        }
        else if (index >= 10)
        {
          window.scrollTo(0, this.$el.closest('.planning-mrp')[0].offsetTop);

          e.currentTarget.scrollIntoView({block: 'center'});

          window.scrollBy(0, (e.clientY - trEl.getBoundingClientRect().top - offset) * -1);
        }
      },
      'wheel': function(e)
      {
        if (e.target.classList.contains('no-scroll') || this.el.classList.contains('is-expanded'))
        {
          window.scrollBy(e.originalEvent.deltaX, e.originalEvent.deltaY);
        }
        else
        {
          this.el.scrollBy(e.originalEvent.deltaX, e.originalEvent.deltaY);
        }

        return false;
      }
    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.mrp.orders, 'reset changed', view.renderIfNotLoading);

      view.listenTo(view.mrp.orders, 'highlight', view.onOrderHighlight);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        orders: this.serializeOrders()
      };
    },

    renderIfNotLoading: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    serializeOrders: function()
    {
      var mrp = this.mrp;
      var map = {};

      mrp.lines.forEach(function(line)
      {
        line.orders.forEach(function(lineOrder)
        {
          var orderNo = lineOrder.get('orderNo');
          var order = mrp.orders.get(orderNo);

          if (!order)
          {
            return;
          }

          var item = map[orderNo];

          if (!item)
          {
            item = map[orderNo] = {
              orderNo: order.id,
              nc12: order.get('nc12'),
              name: order.get('name'),
              startTime: Number.MAX_VALUE,
              finishTime: 0,
              qtyTodo: order.get('quantityTodo'),
              qtyPlan: 0,
              lines: {}
            };
          }

          item.qtyPlan += lineOrder.get('quantity');

          var startTime = Date.parse(lineOrder.get('startAt'));

          if (startTime < item.startTime)
          {
            item.startTime = startTime;
          }

          var finishTime = Date.parse(lineOrder.get('finishAt'));

          if (finishTime > item.finishTime)
          {
            item.finishTime = finishTime;
          }

          if (!item.lines[line.id])
          {
            item.lines[line.id] = 0;
          }

          item.lines[line.id] += lineOrder.get('quantity');
        });
      });

      return _.values(map).sort(function(a, b) { return a.startTime - b.startTime; }).map(function(order, i)
      {
        order.no = i + 1;
        order.shift = shiftUtil.getShiftNo(order.startTime);
        order.startTime = time.utc.format(order.startTime, 'HH:mm:ss');
        order.finishTime = time.utc.format(order.finishTime, 'HH:mm:ss');
        order.lines = _.map(order.lines, function(qty, line) { return line + ' (' + qty + ')'; }).join('; ');

        return order;
      });
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showMenu: function(e)
    {
      var orderNo = e.currentTarget.dataset.id;
      var menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (this.plan.shiftOrders.findOrders(orderNo).length
        || this.plan.getActualOrderData(orderNo).quantityDone)
      {
        menu.push({
          label: t('planning', 'orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, orderNo)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.comment(orderNo));
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleShiftOrderAction: function(orderNo)
    {
      var shiftOrders = this.plan.shiftOrders.findOrders(orderNo);

      if (shiftOrders.length === 1)
      {
        return window.open('/#prodShiftOrders/' + shiftOrders[0].id);
      }

      window.open('/#prodShiftOrders?sort(startedAt)&limit(20)&orderId=' + orderNo);
    },

    onOrderHighlight: function(message)
    {
      if (message.source === 'lineOrders' || !this.mrp.orders.get(message.orderNo))
      {
        return;
      }

      var trEl = this.$('tr[data-id="' + message.orderNo + '"]').toggleClass('is-highlighted', message.state)[0];

      if (trEl && !this.el.classList.contains('is-expanded'))
      {
        this.el.scrollTop = trEl.offsetTop;
      }
    }

  });
});
