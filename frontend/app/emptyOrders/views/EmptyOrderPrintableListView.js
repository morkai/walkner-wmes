define([
  'app/i18n',
  'app/core/views/PrintableListView',
  'i18n!app/nls/emptyOrders'
], function(
  t,
  PrintableListView
) {
  'use strict';

  return PrintableListView.extend({

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
        rows: this.model.toJSON({startFinishDateFormat: 'YYYY-MM-DD'})
      };
    }
  });
});
