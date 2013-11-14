define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'i18n!app/nls/workCenters'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'workCenters.added': 'refreshCollection',
      'workCenters.edited': 'refreshCollection',
      'workCenters.deleted': 'refreshCollection'
    },

    nlsDomain: 'workCenters',

    serialize: function()
    {
      var collection = this.model;

      return {
        columns: [
          {id: '_id', label: t('workCenters', 'PROPERTY:_id')},
          {id: 'description', label: t('workCenters', 'PROPERTY:description')}
        ],
        actions: ListView.actions.viewEditDelete(this.model, 'DICTIONARIES:MANAGE'),
        rows: collection.toJSON()
      };
    }
  });
});
