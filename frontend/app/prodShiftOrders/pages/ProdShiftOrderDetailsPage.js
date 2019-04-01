// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/util/onModelDeleted',
  'app/core/pages/DetailsPage',
  'app/prodChangeRequests/util/createDeletePageAction',
  'app/delayReasons/storage',
  'app/production/settings',
  'app/mechOrders/MechOrder',
  'app/mechOrders/views/MechOrderDetailsView',
  'app/orders/Order',
  'app/orders/OperationCollection',
  'app/orders/views/OrderDetailsView',
  'app/orders/views/OperationListView',
  'app/prodDowntimes/ProdDowntimeCollection',
  'app/prodDowntimes/views/ProdDowntimeListView',
  'app/prodSerialNumbers/ProdSerialNumberCollection',
  '../ProdShiftOrder',
  '../views/ProdShiftOrderDetailsView',
  '../views/SerialNumbersView',
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
  DetailsPage,
  createDeletePageAction,
  delayReasonsStorage,
  productionSettings,
  MechOrder,
  MechOrderDetailsView,
  Order,
  OperationCollection,
  OrderDetailsView,
  OperationListView,
  ProdDowntimeCollection,
  ProdDowntimeListView,
  ProdSerialNumberCollection,
  ProdShiftOrder,
  ProdShiftOrderDetailsView,
  SerialNumbersView,
  detailsPageTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    pageId: 'details',

    modelProperty: 'prodShiftOrder',

    remoteTopics: {},

    actions: function()
    {
      var actions = [{
        label: t.bound('prodShiftOrders', 'PAGE_ACTION:prodLogEntries'),
        icon: 'list-ol',
        href: '#prodLogEntries?sort(createdAt)&limit(-1337)'
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

      this.setView('#-details', this.detailsView);
      this.insertView('#-downtimes', this.downtimesView);
      this.insertView('#-serialNumbers', this.serialNumbersView);
    },

    destroy: function()
    {
      productionSettings.release();
      delayReasonsStorage.release();
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(productionSettings.acquire(), this);

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.prodShiftOrder = bindLoadingMessage(
        new ProdShiftOrder({_id: this.options.modelId}, {settings: this.settings}),
        this
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

      this.prodSerialNumbers = bindLoadingMessage(new ProdSerialNumberCollection(null, {
        rqlQuery: {
          sort: {scannedAt: 1},
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

      this.serialNumbersView = new SerialNumbersView({
        collection: this.prodSerialNumbers,
        model: this.prodShiftOrder
      });
    },

    load: function(when)
    {
      return when(
        this.prodShiftOrder.fetch(),
        this.prodDowntimes.fetch({reset: true}),
        this.prodSerialNumbers.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null,
        this.settings.isEmpty() ? this.settings.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      productionSettings.acquire();
      delayReasonsStorage.acquire();

      this.$id('serialNumbers').toggleClass('hidden', !user.isAllowedTo('PROD_DATA:VIEW'));
    },

    onSync: function()
    {
      this.setUpRemoteTopics();

      var orderData = this.prepareOrderData();
      var prodShiftOrder = this.prodShiftOrder;

      this.order = prodShiftOrder.get('mechOrder')
        ? new MechOrder(orderData)
        : new Order(orderData);

      var orderDetailsViewOptions = {
        model: this.order,
        panelType: 'default',
        panelTitle: t('prodShiftOrders', 'PANEL:TITLE:orderDetails'),
        delayReasons: this.delayReasons
      };

      this.orderDetailsView = prodShiftOrder.get('mechOrder')
        ? new MechOrderDetailsView(orderDetailsViewOptions)
        : new OrderDetailsView(orderDetailsViewOptions);

      this.operationListView = new OperationListView({
        model: this.order,
        showQty: !this.prodShiftOrder.get('mechOrder'),
        highlighted: prodShiftOrder.get('operationNo'),
        summedTimes: {
          laborSetupTime: prodShiftOrder.get('laborSetupTime'),
          laborTime: prodShiftOrder.get('laborTime'),
          machineSetupTime: prodShiftOrder.get('machineSetupTime'),
          machineTime: prodShiftOrder.get('machineTime')
        }
      });

      this.setView('#' + this.idPrefix + '-order', this.orderDetailsView);
      this.setView('#' + this.idPrefix + '-operations', this.operationListView);
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
