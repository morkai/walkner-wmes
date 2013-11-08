define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/orderStatuses/templates/_orderStatus',
  'i18n!app/nls/orderStatuses'
], function(
  t,
  user,
  ListView,
  renderOrderStatus
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'orderStatuses.added': 'refreshCollection',
      'orderStatuses.edited': 'refreshCollection',
      'orderStatuses.deleted': 'refreshCollection'
    },

    nlsDomain: 'orderStatuses',

    serialize: function()
    {
      return {
        columns: [
          {id: 'coloredId', label: t('orderStatuses', 'PROPERTY:_id')},
          {id: 'label', label: t('orderStatuses', 'PROPERTY:label')}
        ],
        actions: ListView.actions.viewEditDelete(this.model, 'ORDER_STATUSES:MANAGE'),
        rows: this.model.toJSON().map(function(orderStatus)
        {
          orderStatus.coloredId = renderOrderStatus(orderStatus);

          return orderStatus;
        })
      };
    }
  });
});
