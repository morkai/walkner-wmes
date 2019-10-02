// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Model'
], function(
  user,
  Model
) {
  'use strict';

  return Model.extend({

    defaults: {

    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.status = obj.completed ? 'completed' : 'waiting';

      obj.rowClassName = 'is-' + obj.status;

      if (obj.status === 'completed')
      {
        obj.schedule = [];
      }
      else if (user.isAllowedTo('PURCHASE_ORDERS:MANAGE'))
      {
        obj.rowClassName += ' is-selectable';
      }

      if (obj.status !== 'completed' && obj.printedQty < obj.qty)
      {
        obj.rowClassName += ' is-inProgress';
      }

      obj.rowSpan = obj.schedule.length || 1;

      return obj;
    }

  });
});
