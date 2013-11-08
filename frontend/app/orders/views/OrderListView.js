define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/data/orderStatuses',
  'app/orderStatuses/templates/_orderStatus',
  'i18n!app/nls/orders'
], function(
  t,
  user,
  ListView,
  orderStatuses,
  renderOrderStatus
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    remoteTopics: {
      'orders.synced': 'refreshCollection',
      'orders.added': 'refreshCollection',
      'orders.edited': 'refreshCollection',
      'orders.deleted': 'refreshCollection'
    },

    nlsDomain: 'orders',

    serialize: function()
    {
      return {
        columns: [
          {id: '_id', label: t('orders', 'PROPERTY:_id')},
          {id: 'nc12', label: t('orders', 'PROPERTY:nc12')},
          {id: 'name', label: t('orders', 'PROPERTY:name')},
          {id: 'mrp', label: t('orders', 'PROPERTY:mrp')},
          {id: 'qtyUnit', label: t('orders', 'PROPERTY:qty')},
          {id: 'startDateText', label: t('orders', 'PROPERTY:startDate')},
          {id: 'finishDateText', label: t('orders', 'PROPERTY:finishDate')},
          {id: 'statusLabels', label: t('orders', 'PROPERTY:statuses')}
        ],
        actions: ListView.actions.viewEditDelete(this.model, 'ORDERS:MANAGE'),
        rows: this.model.toJSON().map(function(row)
        {
          row.statusLabels = orderStatuses
            .findAndFill(row.statuses)
            .map(function(orderStatus) { return renderOrderStatus(orderStatus); })
            .join('');

          return row;
        })
      };
    }
  });
});
