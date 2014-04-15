// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  '../Order',
  '../views/OrderDetailsView',
  '../views/OperationListView',
  '../views/OrderChangesView',
  'app/orders/templates/detailsPage'
], function(
  bindLoadingMessage,
  DetailsPage,
  Order,
  OrderDetailsView,
  OperationListView,
  OrderChangesView,
  detailsPageTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'orderDetails',

    actions: [],

    initialize: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);

      this.detailsView = new OrderDetailsView({model: this.model});
      this.operationsView = new OperationListView({model: this.model});
      this.changesView = new OrderChangesView({model: this.model});

      this.setView('.orders-details-container', this.detailsView);
      this.setView('.orders-operations-container', this.operationsView);
      this.setView('.orders-changes-container', this.changesView);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
