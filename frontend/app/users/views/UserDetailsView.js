define([
  'app/i18n',
  'app/core/views/DetailsView',
  './decorateUser',
  'app/users/templates/details',
  'i18n!app/nls/users'
], function(
  t,
  DetailsView,
  decorateUser,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'companies.synced': 'render',
      'aors.synced': 'render'
    },

    serialize: function()
    {
      var data = DetailsView.prototype.serialize.call(this);

      decorateUser(data.model);

      return data;
    }

  });
});
