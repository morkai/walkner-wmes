// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/wmes-osh-common/dictionaries',
  '../views/DetailsView'
], function(
  DetailsPage,
  dictionaries,
  DetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView,

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      dictionaries.bind(this);
    }

  });
});
