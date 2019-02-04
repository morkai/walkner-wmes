// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/DetailsPage',
  '../views/PfepEntryDetailsView',
  '../views/PfepEntryHistoryView',
  'app/pfepEntries/templates/detailsPage'
], function(
  t,
  DetailsPage,
  PfepEntryDetailsView,
  PfepEntryHistoryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    pageClassName: 'page-max-flex',

    template: template,

    baseBreadcrumb: true,

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('#-properties', this.detailsView);
      this.setView('#-history', this.historyView);
    },

    defineViews: function()
    {
      this.detailsView = new PfepEntryDetailsView({model: this.model});
      this.historyView = new PfepEntryHistoryView({model: this.model});
    }

  });
});
