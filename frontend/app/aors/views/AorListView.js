define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'i18n!app/nls/aors'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'aors.added': 'refreshCollection',
      'aors.edited': 'refreshCollection',
      'aors.deleted': 'refreshCollection'
    },

    nlsDomain: 'aors',

    labelProperty: 'name',

    serialize: function()
    {
      var collection = this.model;

      return {
        columns: [
          {id: 'name', label: t('aors', 'PROPERTY:name')},
          {id: 'description', label: t('aors', 'PROPERTY:description')}
        ],
        actions: ListView.actions.viewEditDelete(this.model, 'DICTIONARIES:MANAGE'),
        rows: collection.toJSON()
      };
    }
  });
});
