// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  '../storage',
  'app/wmes-fap-categories/templates/details'
], function(
  bindLoadingMessage,
  DetailsPage,
  storage,
  template
) {
  'use strict';

  return DetailsPage.extend({

    baseBreadcrumb: '#fap/entries',

    detailsTemplate: template,

    initialize: function()
    {
      var page = this;

      page.serializeDetails = function(model) { return model.serialize(page.categories); };

      DetailsPage.prototype.initialize.apply(page, arguments);
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.apply(this, arguments);

      storage.release();
    },

    defineModels: function()
    {
      DetailsPage.prototype.defineModels.apply(this, arguments);

      this.categories = bindLoadingMessage(storage.acquire(), this);
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.categories.isEmpty() ? this.categories.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.apply(this, arguments);

      storage.acquire();
    }

  });
});
