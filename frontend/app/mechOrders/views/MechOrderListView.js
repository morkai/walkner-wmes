define([
  'app/i18n',
  'app/core/views/ListView',
  'i18n!app/nls/mechOrders'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'mechOrders.synced': 'refreshCollection'
    },

    columns: ['_id', 'name'],

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
      return this.collection.toJSON();
    }

  });
});
