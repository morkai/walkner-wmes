// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  '../util/renderOrderStatusLabel'
], function(
  t,
  user,
  ListView,
  renderOrderStatusLabel
) {
  'use strict';

  return ListView.extend({

    className: 'is-shrinked is-clickable',

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
        orderStatus.coloredId = renderOrderStatusLabel(orderStatus);

        return orderStatus;
      });
    }

  });
});
