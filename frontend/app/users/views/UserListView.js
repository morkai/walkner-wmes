define([
  'app/i18n',
  'app/core/views/ListView',
  'i18n!app/nls/users'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'users.added': 'refreshCollection',
      'users.edited': 'refreshCollection',
      'users.deleted': 'refreshCollection'
    },

    nlsDomain: 'users',

    labelProperty: 'login',

    serialize: function()
    {
      return {
        columns: [
          {id: 'login', label: t('users', 'PROPERTY:login')},
          {id: 'email', label: t('users', 'PROPERTY:email')},
          {id: 'mobile', label: t('users', 'PROPERTY:mobile')}
        ],
        actions: ListView.actions.viewEditDelete(this.model, 'USERS:MANAGE'),
        rows: this.model.toJSON()
      };
    }

  });
});
