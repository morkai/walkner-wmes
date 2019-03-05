// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/mrpControllers/templates/details'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    }

  });
});
