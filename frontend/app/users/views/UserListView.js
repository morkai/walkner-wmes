define([
  'app/i18n',
  'app/core/views/ListView',
  './decorateUser',
  'i18n!app/nls/users'
], function(
  t,
  ListView,
  decorateUser
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'companies.synced': 'render',
      'aors.synced': 'render'
    },

    columns: ['personellId', 'lastName', 'firstName', 'company', 'aor', 'prodFunction'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(decorateUser);
    }

  });
});
