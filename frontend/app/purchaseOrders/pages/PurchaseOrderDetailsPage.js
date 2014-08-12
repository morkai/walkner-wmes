// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/pages/DetailsPage',
  '../views/PurchaseOrderPropsView',
  '../views/PurchaseOrderItemsView',
  '../views/PurchaseOrderChangesView',
  'app/purchaseOrders/templates/detailsPage'
], function(
  DetailsPage,
  PurchaseOrderPropsView,
  PurchaseOrderItemsView,
  PurchaseOrderChangesView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    actions: [],

    remoteTopics: function()
    {
      var topics = {};

      topics['purchaseOrders.synced'] = function(message)
      {
        if (message.created || message.updated || message.closed)
        {
          this.promised(this.model.fetch({update: true}));
        }
      };

      topics['purchaseOrders.printed.' + this.model.id] = function(data)
      {
        this.model.update(data);
      };

      topics['purchaseOrders.cancelled.' + this.model.id] = function(data)
      {
        this.model.update(data);
      };

      return topics;
    },

    initialize: function()
    {
      DetailsPage.prototype.initialize.apply(this, arguments);

      this.setView('.pos-detailsPage-props', this.propsView);
      this.setView('.pos-detailsPage-items', this.itemsView);
      this.setView('.pos-detailsPage-changes', this.changesView);
    },

    defineViews: function()
    {
      this.propsView = new PurchaseOrderPropsView({model: this.model});
      this.itemsView = new PurchaseOrderItemsView({model: this.model});
      this.changesView = new PurchaseOrderChangesView({model: this.model});
    }

  });
});
