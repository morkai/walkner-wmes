// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/View',
  'app/prodChangeRequests/util/createDeletePageAction',
  'app/delayReasons/storage',
  'app/mechOrders/MechOrder',
  'app/mechOrders/views/MechOrderDetailsView',
  'app/orders/Order',
  'app/orders/OperationCollection',
  'app/orders/views/OrderDetailsView',
  'app/orders/views/OperationListView',
  'app/prodDowntimes/ProdDowntimeCollection',
  'app/prodDowntimes/views/ProdDowntimeListView',
  '../ProdShiftOrder',
  '../views/ProdShiftOrderDetailsView',
  'app/prodShiftOrders/templates/detailsPage'
], function(
  _,
  t,
  time,
  user,
  viewport,
  bindLoadingMessage,
  pageActions,
  onModelDeleted,
  View,
  createDeletePageAction,
  delayReasonsStorage,
  MechOrder,
  MechOrderDetailsView,
  Order,
  OperationCollection,
  OrderDetailsView,
  OperationListView,
  ProdDowntimeCollection,
  ProdDowntimeListView,
  ProdShiftOrder,
  ProdShiftOrderDetailsView,
  detailsPageTemplate
) {
  'use strict';

  return View.extend({

    template: detailsPageTemplate,

    layoutName: 'page',

    pageId: 'details',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('prodShiftOrders', 'BREADCRUMBS:browse'),
          href: this.prodShiftOrder.genClientUrl('base')
        },
        this.prodShiftOrder.getLabel()
      ];
    },

    actions: function()
    {
      var actions = [{
        label: t.bound('prodShiftOrders', 'PAGE_ACTION:prodLogEntries'),
        icon: 'list-ol',
        href: '#prodLogEntries?sort(createdAt)&limit(20)'
          + '&prodShiftOrder=' + encodeURIComponent(this.prodShiftOrder.id)
      }];

      if (this.prodShiftOrder.isEditable() && user.isAllowedTo('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST'))
      {
        actions.push(
          pageActions.edit(this.prodShiftOrder, false),
          createDeletePageAction(this, this.prodShiftOrder)
        );
      }

      return actions;
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.listenToOnce(this.prodShiftOrder, 'sync', this.onSync);

      this.setView('.prodShiftOrders-details-container', this.detailsView);
      this.insertView('.prodShiftOrders-downtimes-container', this.downtimesView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.prodShiftOrder = bindLoadingMessage(
        new ProdShiftOrder({_id: this.options.modelId}), this
      );

      this.prodDowntimes = bindLoadingMessage(new ProdDowntimeCollection(null, {
        rqlQuery: {
          sort: {startedAt: 1},
          limit: 9999,
          selector: {
            name: 'and',
            args: [{name: 'eq', args: ['prodShiftOrder', this.prodShiftOrder.id]}]
          }
        }
      }), this);
    },

    defineViews: function()
    {
      this.detailsView = new ProdShiftOrderDetailsView({model: this.prodShiftOrder});

      this.downtimesView = new ProdDowntimeListView({
        collection: this.prodDowntimes,
        simple: true
      });
    },

    load: function(when)
    {
      return when(
        this.prodShiftOrder.fetch(),
        this.prodDowntimes.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();
    },

    onSync: function()
    {
      this.setUpRemoteTopics();

      var orderData = this.prepareOrderData();

      this.order = this.prodShiftOrder.get('mechOrder')
        ? new MechOrder(orderData)
        : new Order(orderData);

      var orderDetailsViewOptions = {
        model: this.order,
        panelType: 'default',
        panelTitle: t('prodShiftOrders', 'PANEL:TITLE:orderDetails'),
        delayReasons: this.delayReasons
      };

      this.orderDetailsView = this.prodShiftOrder.get('mechOrder')
        ? new MechOrderDetailsView(orderDetailsViewOptions)
        : new OrderDetailsView(orderDetailsViewOptions);

      this.operationListView = new OperationListView({
        model: this.order,
        highlighted: this.prodShiftOrder.get('operationNo')
      });

      this.setView('.prodShiftOrders-order-container', this.orderDetailsView);
      this.setView('.prodShiftOrders-operations-container', this.operationListView);
    },

    prepareOrderData: function()
    {
      var orderData = _.clone(this.prodShiftOrder.get('orderData'));

      if (orderData.no)
      {
        orderData._id = orderData.no;
      }

      orderData.operations = new OperationCollection(_.values(orderData.operations || {}));

      return orderData;
    },

    setUpRemoteTopics: function()
    {
      var pressWorksheetId = this.prodShiftOrder.get('pressWorksheet');

      if (pressWorksheetId)
      {
        this.pubsub
          .subscribe('pressWorksheets.edited', this.onWorksheetEdited.bind(this))
          .setFilter(filterWorksheet);

        this.pubsub
          .subscribe('pressWorksheets.deleted', this.onModelDeleted.bind(this))
          .setFilter(filterWorksheet);
      }
      else
      {
        this.pubsub.subscribe(
          'prodShiftOrders.updated.' + this.prodShiftOrder.id,
          this.onProdShiftOrderUpdated.bind(this)
        );

        this.pubsub.subscribe(
          'prodShiftOrders.deleted.' + this.prodShiftOrder.id,
          this.onModelDeleted.bind(this)
        );
      }

      function filterWorksheet(message)
      {
        return message.model._id === pressWorksheetId;
      }
    },

    onProdShiftOrderUpdated: function(changes)
    {
      this.prodShiftOrder.set(changes);
    },

    onWorksheetEdited: function()
    {
      this.timers.refreshData = setTimeout(
        function(page)
        {
          page.promised(page.prodShiftOrder.fetch()).fail(function(xhr)
          {
            if (xhr.status === 404)
            {
              page.onModelDeleted();
            }
          });
        },
        2500,
        this
      );
    },

    onModelDeleted: function()
    {
      onModelDeleted(this.broker, this.prodShiftOrder, null, true);
    }

  });
});
