define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'i18n!app/nls/emptyOrders'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'orderStatuses.synced': 'render'
    },

    remoteTopics: {
      'emptyOrders.synced': 'refreshCollection'
    },

    nlsDomain: 'emptyOrders',

    serialize: function()
    {
      return {
        columns: [
          {id: '_id', label: t('emptyOrders', 'PROPERTY:_id')},
          {id: 'nc12', label: t('emptyOrders', 'PROPERTY:nc12')},
          {id: 'mrp', label: t('emptyOrders', 'PROPERTY:mrp')},
          {id: 'startDateText', label: t('emptyOrders', 'PROPERTY:startDate')},
          {id: 'finishDateText', label: t('emptyOrders', 'PROPERTY:finishDate')}
        ],
        rows: this.model.toJSON()
      };
    }
  });
});
