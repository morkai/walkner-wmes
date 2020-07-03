// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/time',
  'app/i18n',
  'app/core/Model'
], function(
  _,
  user,
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

      if (row.redirLine)
      {
        row.redirLine = _.escape(row.redirLine) + ' ➜ ' + _.escape(row.line);
        row.line = '<i class="fa fa-arrow-right"></i><span>' + _.escape(row.line) + '</span>';
      }

      if (user.isAllowedTo('LOCAL', 'ORDERS:VIEW'))
      {
        row.sapOrder = '<a href="#orders/' + row.sapOrder + '" target="_blank">' + row.sapOrder + '</a>';
      }

      var date = time.utc.format(this.get('date'), 'YYYY-MM-DD');

      if (user.isAllowedTo('WH:VIEW'))
      {
        row.date = '<a href="#wh/pickup/' + date + '?order=' + (row.whOrder || '') + '" target="_blank">'
          + row.date + '</a>';

        row.set = '<a href="#wh/pickup/' + date + '?set=' + (row.whOrder || '') + '"'
          + ' target="_blank" style="display: block">' + row.set + '</a>';
      }

      return row;
    }

  });
});
