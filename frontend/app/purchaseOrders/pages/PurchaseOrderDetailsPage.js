// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

      topics['purchaseOrders.printed.' + this.model.id] = 'onPrinted';

      topics['purchaseOrders.cancelled.' + this.model.id] = 'onPrintCancelled';

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
    },

    load: function(when)
    {
      return when(this.model.fetch(), this.model.prints.fetch({reset: true}));
    },

    onPrinted: function(message)
    {
      this.model.set('printedQty', message.printedQty, {silent: true});

      var items = this.model.get('items');

      message.changedItems.forEach(function(changedItem)
      {
        var item = items.get(changedItem._id);

        if (item)
        {
          item.set('printedQty', changedItem.printedQty);
        }
      });

      this.model.prints.add(message.addedPrints);

      this.model.trigger('change:printedQty');
      this.model.trigger('change:items');
      this.model.trigger('change');
    },

    onPrintCancelled: function(message)
    {
      this.model.set('printedQty', message.printedQty, {silent: true});

      var items = this.model.get('items');

      message.changedItems.forEach(function(changedItem)
      {
        var item = items.get(changedItem._id);

        if (item)
        {
          item.set('printedQty', changedItem.printedQty);
        }
      });

      var prints = this.model.prints;

      message.changedPrints.forEach(function(changedPrint)
      {
        var print = prints.get(changedPrint);

        if (print)
        {
          print.set(message.cancelData);
        }
      });

      this.model.trigger('change:printedQty');
      this.model.trigger('change:items');
      this.model.trigger('change');
    }

  });
});
