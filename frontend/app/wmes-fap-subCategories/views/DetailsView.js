// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/wmes-fap-entries/dictionaries',
  'app/wmes-fap-subCategories/templates/details'
], function(
  DetailsView,
  dictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    getTemplateData: function()
    {
      return {
        subdivisionTypes: dictionaries.subdivisionTypes,
        reqFields: dictionaries.reqFields
      };
    }

  });
});
