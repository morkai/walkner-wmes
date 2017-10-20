// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/data/downtimeReasons',
  'app/planning/util/shift',
  'app/planning/templates/lineOrders',
  'app/planning/templates/lineOrderPopover',
  'app/planning/templates/lineOrderDowntimePopover',
  'app/planning/templates/lineOrderShiftPopover',
  'app/planning/templates/lineOrderLinePopover'
], function(
  _,
  $,
  View,
  downtimeReasons,
  shiftUtil,
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
            orderNo: orderNo
          });
        }
        else
        {
          var externalMrp = this.plan.mrps.get(this.plan.orders.get(orderNo).get('mrp'));

          if (externalMrp)
          {
            externalMrp.orders.trigger('preview', {
              orderNo: orderNo,
              scrollIntoView: true
            });
          }
        }
      },
      'contextmenu .is-lineOrder': function(e)
      {
        e.preventDefault();
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

      view.listenTo(view.prodLineState, 'change:online', view.onOnlineChange);
      view.listenTo(view.prodLineState, 'change:state', view.updateShiftState);
      view.listenTo(view.prodLineState, 'change:prodShift', view.updateShiftState);
      view.listenTo(view.prodLineState, 'change:prodShiftOrders', view.updateShiftState);
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
      if (!this.plan.isProdStateUsed())
      {
        return {
          online: '',
          shift: 0,
          state: '',
          orderNo: ''
        };
      }

      var prodLineState = this.prodLineState;
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

      var anyMissingOrder = false;

      planLine.orders.forEach(function(lineOrder)
      {
        if (anyMissingOrder)
        {
          return;
        }

        var order = plan.orders.get(lineOrder.get('orderNo'));

        if (!order)
        {
          anyMissingOrder = true;

          return;
        }

        var orderData = plan.getActualOrderData(order.id);
        var mrp = order.get('mrp');
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
        var quantityDone = plan.shiftOrders.getTotalQuantityDone(planLine.id, shift.no, order.id);

        shift.orders.push({
          _id: lineOrder.id,
          orderNo: order.id,
          quantity: lineOrder.get('quantity'),
          incomplete: order.get('incomplete') > 0,
          completed: shift.state && quantityDone >= quantityTodo,
          started: shift.state && quantityDone > 0,
          confirmed: orderData.statuses.indexOf('CNF') !== -1,
          delivered: orderData.statuses.indexOf('DLV') !== -1,
          selected: shift.state && order.id === prodState.orderNo,
          finishAt: finishAt,
          margin: (startAt - prevFinishedAt) * 100 / shiftUtil.SHIFT_DURATION,
          width: duration * 100 / shiftUtil.SHIFT_DURATION,
          mrp: mrp,
          external: mrp !== planMrp.id
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
        return !anyMissingOrder && shift && shift.orders.length > 0;
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
      var order = this.plan.orders.get(lineOrder.get('orderNo'));
      var orderData = this.plan.getActualOrderData(order.id);
      var startAt = Date.parse(lineOrder.get('startAt'));
      var finishAt = Date.parse(lineOrder.get('finishAt'));
      var quantityDone = this.plan.isProdStateUsed()
        ? this.plan.shiftOrders.getTotalQuantityDone(this.line.id, shiftUtil.getShiftNo(startAt), order.id)
        : -1;

      return lineOrderPopoverTemplate({
        lineOrder: {
          _id: lineOrder.id,
          orderNo: order.id,
          quantityPlanned: lineOrder.get('quantity'),
          quantityRemaining: orderData.quantityTodo - orderData.quantityDone,
          quantityTotal: orderData.quantityTodo,
          quantityDone: quantityDone,
          pceTime: lineOrder.get('pceTime') / 1000,
          manHours: lineOrder.get('manHours') || 0,
          startAt: startAt,
          finishAt: finishAt,
          duration: (finishAt - startAt) / 1000
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

      if (this.plan.isProdStateUsed())
      {
        $hd.addClass('is-' + (this.prodLineState.get('online') ? 'online' : 'offline'));
      }
    },

    updateShiftOrder: function(planShiftOrder)
    {
      if (!this.plan.isProdStateUsed() || planShiftOrder.get('prodLine') !== this.line.id)
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
      var lineOrder = this.line.orders.get($lineOrder.attr('data-id'));
      var quantityTodo = lineOrder.get('quantity');
      var quantityDone = this.plan.shiftOrders.getTotalQuantityDone(this.line.id, shift, orderNo);

      $lineOrder
        .toggleClass('is-started', quantityDone > 0)
        .toggleClass('is-completed', quantityDone >= quantityTodo);
    }

  });
});
