// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/data/downtimeReasons',
  'app/planning/util/shift',
  'app/planning/templates/lineOrders',
  'app/planning/templates/lineOrderPopover',
  'app/planning/templates/lineDowntimePopover'
], function(
  _,
  $,
  View,
  downtimeReasons,
  shiftUtil,
  lineOrdersTemplate,
  lineOrderPopoverTemplate,
  lineDowntimePopoverTemplate
) {
  'use strict';

  return View.extend({

    template: lineOrdersTemplate,

    events: {},

    initialize: function()
    {

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
        selector: '.planning-mrp-list-item',
        trigger: 'hover',
        placement: 'top',
        html: true,
        content: function()
        {
          if (this.classList.contains('is-downtime'))
          {
            return view.serializeDowntimePopover(this.dataset.id);
          }

          return view.serializeOrderPopover(this.dataset.id);
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

      planLine.orders.forEach(function(lineOrder)
      {
        var order = plan.orders.get(lineOrder.get('orderNo'));
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
        return shift && shift.orders.length > 0;
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

      return lineDowntimePopoverTemplate({
        lineDowntime: {
          reason: downtimeReason ? downtimeReason.getLabel() : downtime.reason,
          startAt: startAt,
          finishAt: finishAt,
          duration: downtime.duration / 1000
        }
      });
    }

  });
});
