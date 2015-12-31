// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/delayReasons/storage',
  '../Order',
  '../util/openOrderPrint',
  '../views/OrderDetailsView',
  '../views/OperationListView',
  '../views/DocumentListView',
  '../views/ComponentListView',
  '../views/OrderChangesView',
  'app/orders/templates/detailsPage'
], function(
  t,
  bindLoadingMessage,
  DetailsPage,
  delayReasonsStorage,
  Order,
  openOrderPrint,
  OrderDetailsView,
  OperationListView,
  DocumentListView,
  ComponentListView,
  OrderChangesView,
  detailsPageTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'orderDetails',

    actions: function()
    {
      return {
        label: t.bound('orders', 'PAGE_ACTION:print'),
        icon: 'print',
        href: '/orders/' + this.model.id + '.html?print',
        callback: function(e)
        {
          return openOrderPrint(e, this.querySelector('a'));
        }
      };
    },

    remoteTopics: {
      'orders.updated.*': 'onOrderUpdated',
      'orders.synced': 'onSynced',
      'orders.*.synced': 'onSynced',
      'orderDocuments.synced': 'onSynced'
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
      this.componentsView = new ComponentListView({model: this.model});
      this.changesView = new OrderChangesView({
        model: this.model,
        delayReasons: this.delayReasons
      });

      this.setView('.orders-details-container', this.detailsView);
      this.setView('.orders-operations-container', this.operationsView);
      this.setView('.orders-documents-container', this.documentsView);
      this.setView('.orders-components-container', this.componentsView);
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
    },

    onSynced: function()
    {
      this.promised(this.model.fetch());
    }

  });
});
