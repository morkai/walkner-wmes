// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/DetailsPage',
  'app/core/util/pageActions',
  '../dictionaries',
  '../views/DetailsView',
  '../views/HistoryView',
  'app/wmes-toolcal-tools/templates/detailsPage'
], function(
  DetailsPage,
  pageActions,
  dictionaries,
  DetailsView,
  HistoryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    actions: function()
    {
      var actions = [];

      if (this.model.canEdit())
      {
        actions.push(pageActions.edit(this.model, false));
      }

      if (this.model.canDelete())
      {
        actions.push(pageActions.delete(this.model, false));
      }

      return actions;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('#-properties', this.detailsView);
      this.setView('#-history', this.historyView);
    },

    destroy: function()
    {
      DetailsPage.prototype.destroy.call(this);

      dictionaries.unload();
    },

    defineViews: function()
    {
      this.detailsView = new DetailsView({model: this.model});
      this.historyView = new HistoryView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch(), dictionaries.load());
    },

    afterRender: function()
    {
      DetailsPage.prototype.afterRender.call(this);

      dictionaries.load();
    }

  });
});
