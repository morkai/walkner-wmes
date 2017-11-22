// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  '../MechOrder',
  'app/orders/views/OperationListView',
  'app/mechOrders/views/MechOrderDetailsView',
  'app/mechOrders/templates/detailsPage'
], function(
  bindLoadingMessage,
  DetailsPage,
  MechOrder,
  OperationListView,
  MechOrderDetailsView,
  detailsPageTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'mechOrderDetails',

    actions: [],

    initialize: function()
    {
      this.model = bindLoadingMessage(new MechOrder({_id: this.options.modelId}), this);

      this.detailsView = new MechOrderDetailsView({model: this.model});
      this.operationsView = new OperationListView({
        model: this.model,
        showQty: false
      });

      this.setView('.mechOrders-details-container', this.detailsView);
      this.setView('.mechOrders-operations-container', this.operationsView);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
