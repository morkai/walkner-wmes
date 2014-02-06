define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
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
  View,
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
        this.prodShiftOrder.get('prodLine'),
        t.bound('prodShiftOrders', 'BREADCRUMBS:details', {
          order: this.prodShiftOrder.get('orderId'),
          operation: this.prodShiftOrder.get('operationNo')
        })
      ];
    },

    actions: function()
    {
      return [{
        label: t.bound('prodShiftOrders', 'PAGE_ACTION:prodLogEntries'),
        icon: 'edit',
        href: '#prodLogEntries?sort(createdAt)&limit(20)'
          + '&prodShiftOrder=' + encodeURIComponent(this.prodShiftOrder.id)
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.listenToOnce(this.prodShiftOrder, 'sync', this.onSync);

      this.setView('.prodShiftOrders-details-container', this.detailsView);
      this.insertView('.prodShiftOrders-downtimes-container', this.downtimesView);
    },

    defineModels: function()
    {
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

      this.downtimesView = new ProdDowntimeListView({collection: this.prodDowntimes});
    },

    load: function(when)
    {
      return when(this.prodShiftOrder.fetch(), this.prodDowntimes.fetch({reset: true}));
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
        panelTitle: t('prodShiftOrders', 'PANEL:TITLE:orderDetails')
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
      this.pubsub.subscribe(
        'prodShiftOrders.updated.' + this.prodShiftOrder.id, this.handleChanges.bind(this)
      );
    },

    handleChanges: function(changes)
    {
      this.prodShiftOrder.set(changes);
    }

  });
});
