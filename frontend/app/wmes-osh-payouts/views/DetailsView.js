// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-payouts/templates/details'
], function(
  DetailsView,
  dictionaries,
  template
) {
  'use strict';

  return DetailsView.extend({

    template,

    getTemplateData: function()
    {
      return {
        currencyFormatter: dictionaries.currencyFormatter
      };
    }

  });
});
