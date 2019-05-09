// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/delayReasons/storage',
  'app/printers/views/PrinterPickerView',
  'app/wmes-fap-entries/dictionaries',
  'app/wmes-fap-entries/EntryCollection',
  '../Order',
  '../OrderCollection',
  '../ComponentCollection',
  '../util/openOrderPrint',
  '../views/OrderDetailsView',
  '../views/OrderListView',
  '../views/OperationListView',
  '../views/DocumentListView',
  '../views/ComponentListView',
  '../views/OrderChangesView',
  '../views/EtoView',
  '../views/FapEntryListView',
  'app/orders/templates/detailsJumpList',
  'i18n!app/nls/wmes-fap-entries'
], function(
  _,
  $,
  t,
  bindLoadingMessage,
  DetailsPage,
  delayReasonsStorage,
  PrinterPickerView,
  fapDictionaries,
  FapEntryCollection,
  Order,
  OrderCollection,
  ComponentCollection,
  openOrderPrint,
  OrderDetailsView,
  OrderListView,
  OperationListView,
  DocumentListView,
  ComponentListView,
  OrderChangesView,
  EtoView,
  FapEntryListView,
  renderJumpList
) {
  'use strict';

  return DetailsPage.extend({

    pageId: 'orderDetails',

    actions: function()
    {
      var page = this;
      var orderNo = page.model.id;

      return [PrinterPickerView.pageAction({view: page, tag: 'orders'}, function(printer)
      {
        openOrderPrint([orderNo], printer);
      })];
    },

    remoteTopics: function()
    {
      var topics = {
        'orders.updated.*': 'onOrderUpdated',
        'orders.synced': 'onSynced',
        'orders.*.synced': 'onSynced',
        'orderDocuments.synced': 'onSynced'
      };

      topics['orders.quantityDone.' + this.model.id] = 'onQuantityDoneChanged';

      return topics;
    },

    events: {
      'click #-jumpList > a': function(e)
      {
        var section = e.currentTarget.getAttribute('href').substring(1);
        var $section = this.$('.' + section);

        var y = $section.offset().top - 14;
        var $navbar = $('.navbar-fixed-top');

        if ($navbar.length)
        {
          y -= $navbar.outerHeight();
        }

        $('html, body').stop(true, false).animate({scrollTop: y});

        return false;
      }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.insertView(this.detailsView);
      this.insertView(this.fapEntriesView);
      this.insertView(this.childOrdersView);
      this.insertView(this.operationsView);
      this.insertView(this.documentsView);
      this.insertView(this.componentsView);
      this.insertView(this.paintComponentsView);
      this.insertView(this.etoView);
      this.insertView(this.changesView);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
      fapDictionaries.unload();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      this.fapEntries = bindLoadingMessage(new FapEntryCollection(null, {
        rqlQuery: 'exclude(changes)&sort(_id)&orderNo=string:' + this.model.id
      }), this);

      this.childOrders = bindLoadingMessage(new OrderCollection(null, {
        paginate: false,
        rqlQuery: 'exclude(operations,bom,documents,changes)'
          + '&sort(mrp,scheduledStartDate)&limit(0)'
          + '&_id!=' + this.model.id
          + '&leadingOrder=' + this.model.id
      }), this);

      this.paintOrders = bindLoadingMessage(new OrderCollection(null, {
        rqlQuery: 'select(mrp,bom)&limit(0)&operations.workCenter=PAINT&leadingOrder=' + this.model.id
      }), this);

      this.paintOrder = new Order({
        bom: new ComponentCollection()
      });
    },

    defineViews: function()
    {
      this.detailsView = new OrderDetailsView({
        model: this.model,
        delayReasons: this.delayReasons
      });

      this.fapEntriesView = new FapEntryListView({
        collection: this.fapEntries
      });

      this.childOrdersView = new OrderListView({
        collection: this.childOrders,
        delayReasons: this.delayReasons,
        panel: {
          title: this.t('PANEL:TITLE:childOrders'),
          className: 'orders-childOrders'
        }
      });

      this.operationsView = new OperationListView({
        model: this.model,
        showQtyMax: true
      });

      this.documentsView = new DocumentListView({
        model: this.model
      });

      this.componentsView = new ComponentListView({
        model: this.model,
        linkDocuments: true,
        linkPfep: true
      });

      this.paintComponentsView = new ComponentListView({
        model: this.paintOrder,
        paint: true,
        linkPfep: true
      });

      this.etoView = new EtoView({
        model: this.model
      });

      this.changesView = new OrderChangesView({
        model: this.model,
        delayReasons: this.delayReasons
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.paintOrders, 'reset', this.onPaintOrdersReset);
      this.listenTo(this.documentsView, 'documentOpened', this.onDocumentOpened);
      this.listenTo(this.documentsView, 'documentClosed', this.onDocumentClosed);
      this.listenTo(this.componentsView, 'bestDocumentRequested', this.onBestDocumentRequested);
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        fapDictionaries.load(),
        this.fapEntries.fetch({reset: true}),
        this.childOrders.fetch({reset: true}),
        this.paintOrders.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();

      fapDictionaries.load();

      this.renderJumpList();
    },

    onOrderUpdated: function(message)
    {
      var order = this.model;

      if (order.id !== message._id || !message.change)
      {
        return;
      }

      var attrs = {};

      _.forEach(message.change.newValues, function(newValue, property)
      {
        if (property === 'qtyMax')
        {
          var newQtyMax = {};

          newQtyMax[newValue.operationNo] = newValue.value;

          newValue = _.defaults(newQtyMax, order.get('qtyMax'));
        }

        attrs[property] = newValue;
      });

      order.set(attrs);
      order.get('changes').push(message.change);
      order.trigger('push:change', message.change);
    },

    onQuantityDoneChanged: function(qtyDone)
    {
      this.model.set('qtyDone', qtyDone);
    },

    onSynced: function()
    {
      this.promised(this.model.fetch());
    },

    renderJumpList: function()
    {
      this.$id('jumpList').remove();
      this.$el.append(renderJumpList({
        idPrefix: this.idPrefix
      }));
    },

    onPaintOrdersReset: function()
    {
      var bom = new ComponentCollection();
      var i = 0;

      this.paintOrders.forEach(function(order)
      {
        order.get('bom').forEach(function(component)
        {
          bom.add(_.assign(
            {orderNo: order.id, mrp: order.get('mrp'), index: i++},
            component.toJSON()
          ));
        });
      });

      this.paintOrder.set('bom', bom);
    },

    onDocumentOpened: function(nc15, win)
    {
      this.componentsView.markDocument(nc15, win);
    },

    onDocumentClosed: function(nc15, win)
    {
      this.componentsView.unmarkDocument(nc15, win);
    },

    onBestDocumentRequested: function(item, contents)
    {
      this.documentsView.openBestDocument(item, contents);
    }

  });
});
