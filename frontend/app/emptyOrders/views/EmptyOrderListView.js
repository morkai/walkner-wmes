define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'emptyOrders.synced': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: '_id', label: t('emptyOrders', 'PROPERTY:_id')},
        {id: 'nc12', label: t('emptyOrders', 'PROPERTY:nc12')},
        {id: 'mrp', label: t('emptyOrders', 'PROPERTY:mrp')},
        {id: 'startDateText', label: t('emptyOrders', 'PROPERTY:startDate')},
        {id: 'finishDateText', label: t('emptyOrders', 'PROPERTY:finishDate')}
      ];
    },

    serializeActions: function()
    {
      return [];
    }
  });
});
