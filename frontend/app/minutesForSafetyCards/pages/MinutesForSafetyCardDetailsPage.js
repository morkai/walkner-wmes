// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/kaizenOrders/dictionaries',
  '../views/MinutesForSafetyCardDetailsView'
], function(
  DetailsPage,
  kaizenDictionaries,
  MinutesForSafetyCardDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    pageClassName: 'page-max-flex',

    DetailsView: MinutesForSafetyCardDetailsView,
    baseBreadcrumb: true,

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      kaizenDictionaries.unload();
    },

    load: function(when)
    {
      return when(this.model.fetch(), kaizenDictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      kaizenDictionaries.load();
    }

  });
});
