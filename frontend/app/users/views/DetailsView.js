// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/loadedModules',
  'app/core/views/DetailsView',
  'app/users/templates/details'
], function(
  loadedModules,
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    localTopics: {
      'companies.synced': 'render',
      'aors.synced': 'render'
    },

    getTemplateData: function()
    {
      return {
        loadedModules: loadedModules
      };
    }

  });
});
