// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/delayReasons/storage',
  '../Order',
  '../views/OrderDetailsView',
  '../views/OperationListView',
  '../views/DocumentListView',
  '../views/OrderChangesView',
  'app/orders/templates/detailsPage'
], function(
  bindLoadingMessage,
  DetailsPage,
  delayReasonsStorage,
  Order,
  OrderDetailsView,
  OperationListView,
  DocumentListView,
  OrderChangesView,
  detailsPageTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'orderDetails',

    actions: [],

    remoteTopics: {
      'orders.updated.*': 'onOrderUpdated'
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);
      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.detailsView = new OrderDetailsView({
        model: this.model,
        delayReasons: this.delayReasons
      });
      this.operationsView = new OperationListView({model: this.model});
      this.documentsView = new DocumentListView({model: this.model});
      this.changesView = new OrderChangesView({
        model: this.model,
        delayReasons: this.delayReasons
      });

      this.setView('.orders-details-container', this.detailsView);
      this.setView('.orders-operations-container', this.operationsView);
      this.setView('.orders-documents-container', this.documentsView);
      this.setView('.orders-changes-container', this.changesView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();
    },

    onOrderUpdated: function(message)
    {
      if (this.model.id === message._id)
      {
        this.model.set('delayReason', message.delayReason);
        this.model.get('changes').push(message.change);
        this.model.trigger('push:change', message.change);
      }
    }

  });
});
