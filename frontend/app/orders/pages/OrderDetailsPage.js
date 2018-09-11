// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/delayReasons/storage',
  'app/printers/views/PrinterPickerView',
  '../Order',
  '../OrderCollection',
  '../ComponentCollection',
  '../util/openOrderPrint',
  '../views/OrderDetailsView',
  '../views/OperationListView',
  '../views/DocumentListView',
  '../views/ComponentListView',
  '../views/OrderChangesView',
  '../views/EtoView',
  'app/orders/templates/detailsJumpList'
], function(
  _,
  $,
  t,
  bindLoadingMessage,
  DetailsPage,
  delayReasonsStorage,
  PrinterPickerView,
  Order,
  OrderCollection,
  ComponentCollection,
  openOrderPrint,
  OrderDetailsView,
  OperationListView,
  DocumentListView,
  ComponentListView,
  OrderChangesView,
  EtoView,
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
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);
      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);
      this.paintOrders = bindLoadingMessage(new OrderCollection(null, {
        rqlQuery: 'select(bom)&operations.workCenter=PAINT&leadingOrder=' + this.options.modelId
      }), this);
      this.paintOrder = new Order({
        bom: new ComponentCollection()
      });

      this.detailsView = new OrderDetailsView({
        model: this.model,
        delayReasons: this.delayReasons
      });
      this.operationsView = new OperationListView({
        model: this.model,
        showQtyMax: true
      });
      this.documentsView = new DocumentListView({model: this.model});
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
      this.etoView = new EtoView({model: this.model});
      this.changesView = new OrderChangesView({
        model: this.model,
        delayReasons: this.delayReasons
      });

      this.insertView(this.detailsView);
      this.insertView(this.operationsView);
      this.insertView(this.documentsView);
      this.insertView(this.componentsView);
      this.insertView(this.paintComponentsView);
      this.insertView(this.etoView);
      this.insertView(this.changesView);

      this.listenTo(this.paintOrders, 'reset', this.onPaintOrdersReset);
      this.listenTo(this.documentsView, 'documentOpened', this.onDocumentOpened);
      this.listenTo(this.documentsView, 'documentClosed', this.onDocumentClosed);
      this.listenTo(this.componentsView, 'bestDocumentRequested', this.onBestDocumentRequested);
    },

    destroy: function()
    {
      delayReasonsStorage.release();
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.paintOrders.fetch({reset: true}),
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();

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
          bom.add(_.assign({}, component.toJSON(), {index: i++}));
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
