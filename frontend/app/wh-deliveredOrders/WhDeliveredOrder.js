// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/i18n',
  'app/core/Model'
], function(
  time,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/old/wh/deliveredOrders',

    clientUrlRoot: '#wh/deliveredOrders',

    topicPrefix: 'old.wh.deliveredOrders',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-deliveredOrders',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.qty = obj.qtyDone + '/' + obj.qtyTodo;
      obj.pceTime = time.toString(obj.pceTime / 1000, false, false);
      obj.date = time.utc.format(obj.date, 'L');
      obj.statusText = t(this.nlsDomain, 'status:' + obj.status);

      return obj;
    },

    serializeRow: function()
    {
      var row = this.serialize();

      if (row.status === 'blocked')
      {
        row.className = 'danger';
      }
      else if (row.status === 'done')
      {
        row.className = 'success';
      }
      else if (row.qtyDone)
      {
        row.className = 'info';
      }
      else
      {
        row.className = '';
      }

      return row;
    }

  });
});
