// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model'
], function(
  _,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    initialize: function(attrs)
    {
      this.startMoment = time.getMoment(attrs.startAt);
      this.finishMoment = time.getMoment(attrs.finishAt);
      this.duration = this.finishMoment.valueOf() - this.startMoment.valueOf();

      var h = this.startMoment.hours();

      this.shiftNo = h >= 6 && h < 14 ? 1 : h >= 14 && h < 22 ? 2 : 3;
    },

    serializePopover: function()
    {
      return {
        _id: this.id,
        orderNo: this.get('orderNo'),
        qty: this.get('qty'),
        incomplete: this.get('incomplete'),
        pceTime: this.get('pceTime') / 1000,
        startAt: this.startMoment.valueOf(),
        finishAt: this.finishMoment.valueOf(),
        duration: this.duration / 1000
      };
    }

  });

});
