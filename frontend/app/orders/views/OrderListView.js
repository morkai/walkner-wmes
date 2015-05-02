// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/data/orderStatuses',
  'app/orderStatuses/util/renderOrderStatusLabel'
], function(
  t,
  user,
  ListView,
  orderStatuses,
  renderOrderStatusLabel
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    remoteTopics: {
      'orders.synced': 'refreshCollection',
      'orders.added': 'refreshCollection',
      'orders.edited': 'refreshCollection',
      'orders.deleted': 'onModelDeleted'
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      'name',
      {id: 'mrp', className: 'is-min'},
      {id: 'qtyUnit', label: t.bound('orders', 'PROPERTY:qty'), className: 'is-min'},
      {id: 'startDateText', label: t.bound('orders', 'PROPERTY:startDate'), className: 'is-min'},
      {id: 'finishDateText', label: t.bound('orders', 'PROPERTY:finishDate'), className: 'is-min'},
      {id: 'delayReason', className: 'is-min'},
      {id: 'statusLabels', label: t.bound('orders', 'PROPERTY:statuses')}
    ],

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        return [ListView.actions.viewDetails(collection.get(row._id))];
      };
    },

    serializeRows: function()
    {
      var delayReasons = this.delayReasons;

      return this.collection.map(function(model)
      {
        var row = model.toJSON();
        var delayReason = delayReasons.get(row.delayReason);

        row.statusLabels = orderStatuses.findAndFill(row.statuses).map(renderOrderStatusLabel).join('');
        row.delayReason = delayReason ? delayReason.getLabel() : '-';

        return row;
      });
    }

  });
});
