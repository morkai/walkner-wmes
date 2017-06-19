// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/kaizenOrders/dictionaries',
  '../views/BehaviorObsCardDetailsView'
], function(
  DetailsPage,
  kaizenDictionaries,
  BehaviorObsCardDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: BehaviorObsCardDetailsView,
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
