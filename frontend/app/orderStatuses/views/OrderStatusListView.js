define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'app/orderStatuses/templates/_orderStatus'
], function(
  t,
  user,
  ListView,
  renderOrderStatus
) {
  'use strict';

  return ListView.extend({

    serializeColumns: function()
    {
      return [
        {id: 'coloredId', label: t('orderStatuses', 'PROPERTY:_id')},
        {id: 'label', label: t('orderStatuses', 'PROPERTY:label')}
      ];
    },

    serializeRows: function()
    {
      return this.collection.toJSON().map(function(orderStatus)
      {
        orderStatus.coloredId = renderOrderStatus(orderStatus);

        return orderStatus;
      });
    }

  });
});
