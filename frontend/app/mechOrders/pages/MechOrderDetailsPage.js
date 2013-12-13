define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/core/views/DetailsView',
  '../MechOrder',
  'app/orders/views/OperationListView',
  'app/mechOrders/templates/detailsPage',
  'app/mechOrders/templates/details',
  'i18n!app/nls/mechOrders'
], function(
  bindLoadingMessage,
  DetailsPage,
  DetailsView,
  MechOrder,
  OperationListView,
  detailsPageTemplate,
  detailsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'mechOrderDetails',

    actions: [],

    initialize: function()
    {
      this.model = bindLoadingMessage(new MechOrder({_id: this.options.modelId}), this);

      this.detailsView = new DetailsView({
        template: detailsTemplate,
        model: this.model
      });
      this.operationsView = new OperationListView({model: this.model});

      this.setView('.mechOrders-details-container', this.detailsView);
      this.setView('.mechOrders-operations-container', this.operationsView);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
