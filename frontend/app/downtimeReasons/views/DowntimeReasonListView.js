define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView',
  'i18n!app/nls/downtimeReasons'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'downtimeReasons.added': 'refreshCollection',
      'downtimeReasons.edited': 'refreshCollection',
      'downtimeReasons.deleted': 'refreshCollection'
    },

    nlsDomain: 'downtimeReasons',

    serialize: function()
    {
      return {
        columns: [
          {id: '_id', label: t('downtimeReasons', 'PROPERTY:_id')},
          {id: 'label', label: t('downtimeReasons', 'PROPERTY:label')}
        ],
        actions: ListView.actions.viewEditDelete(this.model, 'DICTIONARIES:MANAGE'),
        rows: this.model.toJSON()
      };
    }
  });
});
