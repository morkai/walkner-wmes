// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/data/downtimeReasons',
  '../util/shift',
  '../util/contextMenu',
  'app/planning/templates/lineOrders',
  'app/planning/templates/lineOrderPopover',
  'app/planning/templates/lineOrderDowntimePopover',
  'app/planning/templates/lineOrderShiftPopover',
  'app/planning/templates/lineOrderLinePopover'
], function(
  _,
  $,
  t,
  user,
  View,
  downtimeReasons,
  shiftUtil,
  contextMenu,
  lineOrdersTemplate,
  lineOrderPopoverTemplate,
  lineOrderDowntimePopoverTemplate,
  lineOrderShiftPopoverTemplate,
  lineOrderLinePopoverTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersTemplate,

    events: {
      'mouseenter .is-lineOrder': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: true,
          orderNo: this.line.orders.get(e.currentTarget.dataset.id).get('orderNo')
        });
      },
      'mouseleave .is-lineOrder': function(e)
      {
        this.mrp.orders.trigger('highlight', {
          source: 'lineOrders',
          state: false,
          orderNo: this.line.orders.get(e.currentTarget.dataset.id).get('orderNo')
        });
      },
      'click .is-lineOrder': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        var orderNo = this.line.orders.get(e.currentTarget.dataset.id).get('orderNo');

        if (e.ctrlKey)
        {
          window.open('#orders/' + orderNo);

          return;
        }

        if (this.mrp.orders.get(orderNo))
        {
          this.mrp.orders.trigger('preview', {
            orderNo: orderNo,
            source: 'lineOrders'
          });

          return;
        }

        var planOrder = this.plan.orders.get(orderNo);

        if (!planOrder)
        {
          return;
        }

        var externalMrp = this.plan.mrps.get(planOrder.get('mrp'));

        if (!externalMrp)
        {
          return;
        }

        externalMrp.orders.trigger('preview', {
          orderNo: orderNo,
          scrollIntoView: true,
          source: 'lineOrders'
        });
      },
      'contextmenu .is-lineOrder': function(e)
      {
        this.showLineOrderMenu(e);

        return false;
      },
      'contextmenu .is-downtime': function(e)
      {
        e.preventDefault();
      }
    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.plan, 'change:active', this.renderIfNotLoading);

      view.listenTo(view.plan.displayOptions, 'change:useLatestOrderData', view.render);

      view.listenTo(view.plan.shiftOrders, 'add', view.updateShiftOrder);
      view.listenTo(view.plan.shiftOrders, 'change:quantityDone', view.updateShiftOrder);

      view.listenTo(view.plan.sapOrders, 'reset', view.onSapOrdersReset);

      view.listenTo(view.line.orders, 'reset', view.renderIfNotLoading);

      view.listenTo(view.mrp.orders, 'highlight', view.onOrderHighlight);
      view.listenTo(view.mrp.orders, 'change:incomplete', view.onIncompleteChange);

      if (view.prodLineState)
      {
        view.listenTo(view.prodLineState, 'change:online', view.onOnlineChange);
        view.listenTo(view.prodLineState, 'change:state', view.updateShiftState);
        view.listenTo(view.prodLineState, 'change:prodShift', view.updateShiftState);
        view.listenTo(view.prodLineState, 'change:prodShiftOrders', view.updateShiftState);
      }
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      var prodState = this.serializeProdState();

      return {
        idPrefix: this.idPrefix,
        line: this.line.id,
        prodState: prodState,
        shifts: this.serializeShifts(prodState)
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$el.popover({
        container: view.el,
        selector: 'div[data-popover-content]',
        trigger: 'hover',
        html: true,
        placement: function()
        {
          return this.$element.attr('data-popover-placement') || 'top';
        },
        hasContent: true,
        content: function()
        {
          switch (this.dataset.popoverContent)
          {
            case 'lineOrder':
              return view.serializeOrderPopover(this.dataset.id);

            case 'downtime':
              return view.serializeDowntimePopover(this.dataset.id);

            case 'shift':
              return view.serializeShiftPopover(this.dataset.shift - 1);

            case 'line':
              return view.serializeLinePopover();
          }
        },
        template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      });
    },

    renderIfNotLoading: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializeProdState: function()
    {
      var prodLineState = this.prodLineState;

      if (!prodLineState || !this.plan.isProdStateUsed())
      {
        return {
          online: '',
          shift: 0,
          state: '',
          orderNo: ''
        };
      }

      var prodShift = prodLineState.get('prodShift');
      var prodShiftOrder = prodLineState.getCurrentOrder();

      return {
        online: prodLineState.get('online') ? 'is-online' : 'is-offline',
        state: prodLineState.get('state') || '',
        shift: prodShift ? prodShift.get('shift') : 0,
        orderNo: prodShiftOrder ? prodShiftOrder.get('orderId') : ''
      };
    },

    serializeShifts: function(prodState)
    {
      var plan = this.plan;
      var planMrp = this.mrp;
      var planLine = this.line;
      var shifts = [];

      if (planLine.orders.length === 0)
      {
        return shifts;
      }

      [0, 1, 2, 3].forEach(function(no)
      {
        shifts.push({
          no: no,
          state: prodState.shift === no ? prodState.state : '',
          startTime: 0,
          orders: [],
          downtimes: []
        });
      });

      planLine.orders.forEach(function(lineOrder)
      {
        var orderNo = lineOrder.get('orderNo');
        var order = plan.orders.get(orderNo);
        var orderData = plan.getActualOrderData(orderNo);
        var mrp = order ? order.get('mrp') : order;
        var startAt = Date.parse(lineOrder.get('startAt'));
        var finishAt = Date.parse(lineOrder.get('finishAt'));
        var duration = finishAt - startAt;
        var shift = shifts[shiftUtil.getShiftNo(startAt)];

        if (shift.startTime === 0)
        {
          shift.startTime = shiftUtil.getShiftStartTime(startAt);
        }

        var prevShiftOrder = shift.orders[shift.orders.length - 1];
        var prevFinishedAt = prevShiftOrder ? prevShiftOrder.finishAt : shift.startTime;
        var quantityTodo = lineOrder.get('quantity');
        var quantityDone = plan.shiftOrders.getTotalQuantityDone(planLine.id, shift.no, orderNo);

        shift.orders.push({
          _id: lineOrder.id,
          orderNo: orderNo,
          quantity: lineOrder.get('quantity'),
          missing: order ? '' : 'is-missing',
          incomplete: order && order.get('incomplete') > 0 ? 'is-incomplete' : '',
          completed: quantityDone >= quantityTodo ? 'is-completed' : '',
          started: quantityDone > 0 && quantityDone < quantityTodo ? 'is-started' : '',
          confirmed: orderData.statuses.indexOf('CNF') !== -1 ? 'is-cnf' : '',
          delivered: orderData.statuses.indexOf('DLV') !== -1 ? 'is-dlv' : '',
          selected: shift.state && orderNo === prodState.orderNo ? 'is-selected' : '',
          external: mrp !== planMrp.id ? 'is-external' : '',
          finishAt: finishAt,
          margin: (startAt - prevFinishedAt) * 100 / shiftUtil.SHIFT_DURATION,
          width: duration * 100 / shiftUtil.SHIFT_DURATION,
          mrp: mrp
        });
      });

      planLine.get('downtimes').forEach(function(downtime, i)
      {
        var startAt = Date.parse(downtime.startAt);
        var shift = shifts[shiftUtil.getShiftNo(startAt)];

        shift.downtimes.push({
          _id: i,
          reason: downtime.reason,
          left: (startAt - shift.startTime) * 100 / shiftUtil.SHIFT_DURATION,
          width: downtime.duration * 100 / shiftUtil.SHIFT_DURATION
        });
      });

      return shifts.filter(function(shift)
      {
        return shift && shift.orders.length > 0;
      });
    },

    serializeLinePopover: function()
    {
      var hourlyPlan = this.line.get('hourlyPlan');
      var orderCount = 0;
      var quantity = 0;
      var manHours = 0;

      (this.line.get('shiftData') || []).forEach(function(shift)
      {
        orderCount += shift.orderCount;
        quantity += shift.quantity;
        manHours += shift.manHours;
      });

      return lineOrderLinePopoverTemplate({
        stats: {
          orderCount: orderCount,
          quantity: quantity,
          manHours: manHours,
          hourlyPlan: hourlyPlan
        }
      });
    },

    serializeShiftPopover: function(shiftI)
    {
      var hourlyPlan = this.line.get('hourlyPlan').slice(shiftI * 8, shiftI * 8 + 8);
      var shiftData = (this.line.get('shiftData') || [])[shiftI] || {};

      return lineOrderShiftPopoverTemplate({
        stats: {
          orderCount: shiftData.orderCount || 0,
          quantity: shiftData.quantity || 0,
          manHours: shiftData.manHours || 0,
          hourlyPlan: hourlyPlan
        }
      });
    },

    serializeOrderPopover: function(id)
    {
      var lineOrder = this.line.orders.get(id);
      var orderNo = lineOrder.get('orderNo');
      var sapOrder = this.plan.sapOrders.get(orderNo);
      var orderData = this.plan.getActualOrderData(orderNo);
      var startAt = Date.parse(lineOrder.get('startAt'));
      var finishAt = Date.parse(lineOrder.get('finishAt'));
      var quantityDone = this.plan.isProdStateUsed()
        ? this.plan.shiftOrders.getTotalQuantityDone(this.line.id, shiftUtil.getShiftNo(startAt), orderNo)
        : -1;

      return lineOrderPopoverTemplate({
        lineOrder: {
          _id: lineOrder.id,
          orderNo: orderNo,
          quantityPlanned: lineOrder.get('quantity'),
          quantityRemaining: orderData.quantityTodo - orderData.quantityDone,
          quantityTotal: orderData.quantityTodo,
          quantityDone: quantityDone,
          pceTime: lineOrder.get('pceTime') / 1000,
          manHours: lineOrder.get('manHours') || 0,
          startAt: startAt,
          finishAt: finishAt,
          duration: (finishAt - startAt) / 1000,
          comment: sapOrder ? sapOrder.getCommentWithIcon() : ''
        }
      });
    },

    serializeDowntimePopover: function(id)
    {
      var downtime = this.line.get('downtimes')[id];
      var startAt = Date.parse(downtime.startAt);
      var finishAt = startAt + downtime.duration;
      var downtimeReason = downtimeReasons.get(downtime.reason);

      return lineOrderDowntimePopoverTemplate({
        lineDowntime: {
          reason: downtimeReason ? downtimeReason.getLabel() : downtime.reason,
          startAt: startAt,
          finishAt: finishAt,
          duration: downtime.duration / 1000
        }
      });
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showLineOrderMenu: function(e)
    {
      var lineOrder = this.line.orders.get(this.$(e.currentTarget).attr('data-id'));
      var orderNo = lineOrder.get('orderNo');
      var menu = [
        contextMenu.actions.sapOrder(orderNo)
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW')
        && (this.plan.shiftOrders.findOrders(orderNo).length
        || this.plan.getActualOrderData(orderNo).quantityDone))
      {
        menu.push({
          icon: 'fa-file-text-o',
          label: t('planning', 'orders:menu:shiftOrder'),
          handler: this.handleShiftOrderAction.bind(this, lineOrder)
        });
      }

      if (this.plan.canCommentOrders())
      {
        menu.push(contextMenu.actions.comment(orderNo));
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleShiftOrderAction: function(lineOrder)
    {
      var orderNo = lineOrder.get('orderNo');
      var line = this.line.id;
      var shift = shiftUtil.getShiftNo(lineOrder.get('startAt'));
      var shiftOrders = this.plan.shiftOrders.findOrders(orderNo, line, shift);

      if (shiftOrders.length === 1)
      {
        return window.open('/#prodShiftOrders/' + shiftOrders[0].id);
      }

      if (shiftOrders.length)
      {
        return window.open(
          '/#prodShiftOrders?sort(startedAt)&limit(-1337)'
            + '&orderId=' + orderNo
            + '&prodLine=' + encodeURIComponent(line)
            + '&shift=' + shift
        );
      }

      shiftOrders = this.plan.shiftOrders.findOrders(orderNo, line);

      if (shiftOrders.length === 1)
      {
        return window.open('/#prodShiftOrders/' + shiftOrders[0].id);
      }

      if (shiftOrders.length)
      {
        return window.open(
          '/#prodShiftOrders?sort(startedAt)&limit(-1337)'
            + '&orderId=' + orderNo
            + '&prodLine=' + encodeURIComponent(line)
        );
      }

      shiftOrders = this.plan.shiftOrders.findOrders(orderNo);

      if (shiftOrders.length === 1)
      {
        return window.open('/#prodShiftOrders/' + shiftOrders[0].id);
      }

      window.open('/#prodShiftOrders?sort(startedAt)&limit(-1337)&orderId=' + orderNo);
    },

    updateShiftState: function()
    {
      var prodState = this.serializeProdState();

      var $shifts = this.$('.planning-mrp-lineOrders-shift').attr('data-state', '');
      var $shift = $shifts.filter('[data-shift="' + prodState.shift + '"]');

      if ($shift.length && prodState.state)
      {
        $shift.attr('data-state', prodState.state);
      }

      this.$('.is-selected').removeClass('is-selected');

      if (prodState.shift && prodState.orderNo)
      {
        this.$id('list-' + prodState.shift)
          .find('.is-lineOrder[data-order-no="' + prodState.orderNo + '"]')
          .addClass('is-selected');
      }
    },

    onOrderHighlight: function(message)
    {
      this.$('.is-lineOrder[data-order-no="' + message.orderNo + '"]')
        .toggleClass('is-highlighted', message.state);
    },

    onIncompleteChange: function(model)
    {
      this.$('.is-lineOrder[data-order-no="' + model.id + '"]')
        .toggleClass('is-incomplete', model.get('incomplete') > 0);
    },

    onSapOrdersReset: function(sapOrders, options)
    {
      if (!options.reload && this.plan.displayOptions.isLatestOrderDataUsed())
      {
        this.render();
      }
    },

    onOnlineChange: function()
    {
      var $hd = this.$('.planning-mrp-list-hd').removeClass('is-online is-offline');

      if (this.prodLineState && this.plan.isProdStateUsed())
      {
        $hd.addClass('is-' + (this.prodLineState.get('online') ? 'online' : 'offline'));
      }
    },

    updateShiftOrder: function(planShiftOrder)
    {
      if (!this.prodLineState || !this.plan.isProdStateUsed() || planShiftOrder.get('prodLine') !== this.line.id)
      {
        return;
      }

      var prodShift = this.prodLineState.get('prodShift');

      if (!prodShift)
      {
        return;
      }

      var shift = prodShift.get('shift');
      var orderNo = planShiftOrder.get('orderId');
      var $lineOrder = this.$id('list-' + shift).find('.is-lineOrder[data-order-no="' + orderNo + '"]');

      if (!$lineOrder.length)
      {
        return;
      }

      var lineOrder = this.line.orders.get($lineOrder.attr('data-id'));

      if (!lineOrder)
      {
        return;
      }

      var quantityTodo = lineOrder.get('quantity');
      var quantityDone = this.plan.shiftOrders.getTotalQuantityDone(this.line.id, shift, orderNo);

      $lineOrder
        .toggleClass('is-started', quantityDone > 0)
        .toggleClass('is-completed', quantityDone >= quantityTodo);
    }

  });
});
