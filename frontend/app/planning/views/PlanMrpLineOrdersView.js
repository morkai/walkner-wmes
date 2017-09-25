// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/planning/util/shift',
  'app/planning/templates/lineOrders',
  'app/planning/templates/lineOrderPopover'
], function(
  _,
  $,
  View,
  shiftUtil,
  lineOrdersTemplate,
  lineOrderPopoverTemplate
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
        line: this.model.mrpLine.id,
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
        content: function() { return view.serializePopover(this.dataset.id); },
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
      var planMrp = this.model.planMrp;
      var line = this.model.mrpLine;
      var shifts = [];

      if (line.orders.length === 0)
      {
        return shifts;
      }

      var s = {
        1: [],
        2: [],
        3: []
      };

      line.orders.forEach(function(lineOrder)
      {
        var order = planMrp.orders.get(lineOrder.get('orderNo'));
        var mrp = order.get('mrp');
        var startAt = Date.parse(lineOrder.get('startAt'));
        var finishAt = Date.parse(lineOrder.get('finishAt'));
        var duration = finishAt - startAt;
        var shiftNo = shiftUtil.getShiftNo(startAt);
        var shiftOrders = s[shiftNo];
        var prevShiftOrder = shiftOrders[shiftOrders.length - 1];
        var prevFinishedAt = prevShiftOrder
          ? prevShiftOrder.finishAt
          : shiftUtil.getShiftStartTime(startAt);

        shiftOrders.push({
          _id: lineOrder.id,
          orderNo: lineOrder.get('orderNo'),
          quantity: lineOrder.get('quantity'),
          incomplete: order.get('incomplete') > 0,
          margin: (startAt - prevFinishedAt) * 100 / shiftUtil.SHIFT_DURATION,
          width: duration * 100 / shiftUtil.SHIFT_DURATION,
          mrp: mrp,
          external: mrp !== planMrp.mrp._id
        });
      });

      if (s[1].length)
      {
        shifts.push({no: 1, orders: s[1]});
      }

      if (s[2].length)
      {
        shifts.push({no: 2, orders: s[2]});
      }

      if (s[3].length)
      {
        shifts.push({no: 3, orders: s[3]});
      }

      return shifts;
    },

    serializePopover: function(id)
    {
      var lineOrder = this.model.mrpLine.orders.get(id);
      var order = this.model.planMrp.orders.get(lineOrder.get('orderNo'));
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
    }

  });
});
