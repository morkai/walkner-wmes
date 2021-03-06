// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/views/ListView'
], function(
  _,
  t,
  time,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored is-clickable',

    remoteTopics: {
      'xiconf.orders.**': 'refreshCollection'
    },

    columns: [
      {id: 'orderNo', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      {id: 'quantity', className: 'is-min'},
      {id: 'reqDate', className: 'is-min'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      'name'
    ],

    serializeActions: function()
    {
      return null;
    },

    serializeRows: function()
    {
      var canViewOrders = user.isAllowedTo('ORDERS:VIEW');

      function linkToOrder(model)
      {
        return canViewOrders ? ('<a href="#orders/' + model.id + '">' + model.id + '</a>') : model.id;
      }

      return this.collection.map(function(model)
      {
        var quantityDone = model.get('quantityDone') || 0;
        var quantityTodo = model.get('quantityTodo') || 0;
        var startedAt = Date.parse(model.get('startedAt')) || 0;
        var finishedAt = Date.parse(model.get('finishedAt')) || Date.now();
        var duration = startedAt ? (finishedAt - startedAt) / 1000 : null;

        return {
          _id: model.id,
          className: 'xiconfOrders-list-item ' + model.getStatusClassName(),
          orderNo: linkToOrder(model),
          nc12: model.get('nc12')[0],
          name: model.get('name'),
          quantity: quantityDone.toLocaleString() + '/' + quantityTodo.toLocaleString(),
          reqDate: time.format(model.get('reqDate'), 'L'),
          startedAt: startedAt ? time.format(startedAt, 'L, LTS') : null,
          duration: duration !== null ? time.toString(duration) : null
        };
      });
    }

  });
});
