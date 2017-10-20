// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  './util/shift'
], function(
  Model,
  shiftUtil
) {
  'use strict';

  return Model.extend({

    getShiftNo: function()
    {
      return shiftUtil.getShiftNo(this.get('startAt'));
    }

  });
});
