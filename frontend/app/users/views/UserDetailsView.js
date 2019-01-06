// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/loadedModules',
  'app/core/views/DetailsView',
  'app/users/templates/details'
], function(
  _,
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

    serialize: function()
    {
      return _.extend(DetailsView.prototype.serialize.call(this), {
        loadedModules: loadedModules
      });
    }

  });
});
