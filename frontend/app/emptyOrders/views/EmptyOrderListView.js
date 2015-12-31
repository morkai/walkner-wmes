// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'nc12', className: 'is-min'},
      {id: 'mrp', className: 'is-min'},
      {id: 'startDateText', label: t.bound('emptyOrders', 'PROPERTY:startDate'), className: 'is-min'},
      {id: 'finishDateText', label: t.bound('emptyOrders', 'PROPERTY:finishDate')}
    ],

    serializeActions: function()
    {
      return [];
    }
  });
});
