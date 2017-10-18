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
      this.listenTo(this.line.orders, 'reset', this.render);
      this.listenTo(this.mrp.orders, 'highlight', this.onOrderHighlight);
      this.listenTo(this.mrp.orders, 'change:incomplete', this.onIncompleteChange);
    },

    destroy: function()
    {
      this.$el.popover('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        line: this.line.id,
        shifts: this.serializeShifts()
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

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializeShifts: function()
    {
      var plan = this.plan;
      var planMrp = this.mrp;
      var planLine = this.line;
      var shifts = [];

      if (planLine.orders.length === 0)
      {
        return shifts;
      }

      shifts.push(
        null,
        {no: 1, startTime: 0, orders: [], downtimes: []},
        {no: 2, startTime: 0, orders: [], downtimes: []},
        {no: 3, startTime: 0, orders: [], downtimes: []}
      );

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

        shift.orders.push({
          _id: lineOrder.id,
          orderNo: lineOrder.get('orderNo'),
          quantity: lineOrder.get('quantity'),
          incomplete: order.get('incomplete') > 0,
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
      var startAt = Date.parse(lineOrder.get('startAt'));
      var finishAt = Date.parse(lineOrder.get('finishAt'));

      return lineOrderPopoverTemplate({
        lineOrder: {
          _id: lineOrder.id,
          orderNo: order.id,
          quantityPlanned: lineOrder.get('quantity'),
          quantityRemaining: order.get('quantityTodo') - order.get('quantityDone'),
          quantityTotal: order.get('quantityTodo'),
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

    onOrderHighlight: function(message)
    {
      this.$('.is-lineOrder[data-id^="' + message.orderNo + '"]').toggleClass('is-highlighted', message.state);
    },

    onIncompleteChange: function(model)
    {
      this.$('.is-lineOrder[data-id^="' + model.id + '"]').toggleClass('is-incomplete', model.get('incomplete') > 0);
    }

  });
});
