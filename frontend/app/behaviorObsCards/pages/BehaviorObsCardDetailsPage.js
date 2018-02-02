// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  'app/kaizenOrders/dictionaries',
  '../views/BehaviorObsCardDetailsView'
], function(
  DetailsPage,
  pageActions,
  kaizenDictionaries,
  BehaviorObsCardDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: BehaviorObsCardDetailsView,
    baseBreadcrumb: true,

    actions: function()
    {
      var model = this.model;
      var actions = [];

      if (model.canEdit())
      {
        actions.push(pageActions.edit(model, false));
      }

      if (model.canDelete())
      {
        actions.push(pageActions.delete(model, false));
      }

      return actions;
    },

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
