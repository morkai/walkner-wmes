// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/planning-orderGroups/templates/details'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template

  });
});
