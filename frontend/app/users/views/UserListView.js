define([
  'app/i18n',
  'app/core/views/ListView',
  './decorateUser'
], function(
  t,
  ListView,
  decorateUser
) {
  'use strict';

  return ListView.extend({

    localTopics: {
      'companies.synced': 'render'
    },

    columns: ['personellId', 'lastName', 'firstName', 'company', 'orgUnit', 'prodFunction'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(decorateUser);
    }

  });
});
