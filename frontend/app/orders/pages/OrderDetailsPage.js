// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
  'app/core/pages/DetailsPage',
  'app/data/loadedModules',
  'app/data/localStorage',
  'app/delayReasons/storage',
  'app/printers/views/PrinterPickerView',
  'app/wmes-fap-entries/dictionaries',
  'app/wmes-fap-entries/EntryCollection',
  'app/prodDowntimes/ProdDowntimeCollection',
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
  '../views/DowntimeListView',
  'app/orders/templates/detailsJumpList',
  'i18n!app/nls/wmes-fap-entries'
], function(
  _,
  $,
  t,
  user,
  bindLoadingMessage,
  embedded,
  DetailsPage,
  loadedModules,
  localStorage,
  delayReasonsStorage,
  PrinterPickerView,
  fapDictionaries,
  FapEntryCollection,
  ProdDowntimeCollection,
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
  DowntimeListView,
  jumpListTemplate
) {
  'use strict';

  return DetailsPage.extend({

    pageId: 'orderDetails',

    actions: function()
    {
      var actions = [];
      var orderNo = this.model.id;

      if (loadedModules.isLoaded('wmes-ct'))
      {
        actions.push({
          label: this.t('PAGE_ACTION:cycleTime'),
          icon: 'clock-o',
          href: '#ct/reports/pce?orders=' + orderNo,
          privileges: 'PROD_DATA:VIEW'
        });
      }

      actions.push(PrinterPickerView.pageAction({view: this, tag: 'orders'}, function(printer)
      {
        openOrderPrint([orderNo], printer);
      }));

      return actions;
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
      },
      'click .btn[data-action="togglePanel"]': function(e)
      {
        var $action = this.$(e.currentTarget);
        var $panel = $action.closest('.panel');
        var panelId = $panel[0].dataset.id;
        var panelToggles = JSON.parse(localStorage.getItem('WMES_ORDERS_PANEL_TOGGLES') || '{}');
        var expanded = !$panel.hasClass('is-expanded');

        panelToggles[panelId] = expanded;

        localStorage.setItem('WMES_ORDERS_PANEL_TOGGLES', JSON.stringify(panelToggles));

        $panel.toggleClass('is-expanded', expanded);
        $action.toggleClass('active', expanded);
      }
    },

    initialize: function()
    {
      var page = this;

      page.defineModels();
      page.defineViews();
      page.defineBindings();

      _.forEach(page.views_, function(view, id)
      {
        page.insertView(view);
      });
    },

    destroy: function()
    {
      delayReasonsStorage.release();
      fapDictionaries.unload();
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(new Order({_id: this.options.modelId}), this);

      if (loadedModules.isLoaded('prodDowntimes') && user.isAllowedTo('PROD_DATA:VIEW', 'PROD_DOWNTIMES:VIEW'))
      {
        this.downtimes = bindLoadingMessage(new ProdDowntimeCollection(null, {
          rqlQuery: 'exclude(changes)&sort(prodLine,startedAt)&orderId=string:' + this.model.id
        }), this);
      }

      this.delayReasons = bindLoadingMessage(delayReasonsStorage.acquire(), this);

      if (loadedModules.isLoaded('wmes-fap') && user.isAllowedTo('USER'))
      {
        this.fapEntries = bindLoadingMessage(new FapEntryCollection(null, {
          rqlQuery: 'exclude(changes)&sort(_id)&orderNo=string:' + this.model.id
        }), this);
      }

      this.childOrders = bindLoadingMessage(new OrderCollection(null, {
        paginate: false,
        rqlQuery: 'exclude(operations,bom,documents,changes)'
          + '&sort(mrp,scheduledStartDate)&limit(0)'
          + '&_id!=' + this.model.id
          + '&leadingOrder=' + this.model.id
      }), this);

      if (loadedModules.isLoaded('paintShop'))
      {
        this.paintOrders = bindLoadingMessage(new OrderCollection(null, {
          rqlQuery: 'select(mrp,bom)&limit(0)&operations.workCenter=PAINT&leadingOrder=' + this.model.id
        }), this);

        this.paintOrder = new Order({
          bom: new ComponentCollection()
        });
      }
    },

    defineViews: function()
    {
      this.views_ = {};

      this.views_.details = new OrderDetailsView({
        model: this.model,
        delayReasons: this.delayReasons
      });

      this.views_.downtimes = !this.downtimes ? null : new DowntimeListView({
        collection: this.downtimes
      });

      this.views_.fapEntries = !this.fapEntries ? null : new FapEntryListView({
        collection: this.fapEntries
      });

      this.views_.childOrders = new OrderListView({
        tableClassName: 'table-bordered table-hover table-condensed table-striped',
        collection: this.childOrders,
        delayReasons: this.delayReasons,
        panel: {
          title: this.t('PANEL:TITLE:childOrders'),
          className: 'orders-childOrders'
        }
      });

      this.views_.operations = new OperationListView({
        model: this.model,
        showQtyMax: true
      });

      this.views_.documents = new DocumentListView({
        model: this.model
      });

      this.views_.components = new ComponentListView({
        model: this.model,
        linkDocuments: true,
        linkPfep: true
      });

      this.views_.paintComponents = !this.paintOrder ? null : new ComponentListView({
        model: this.paintOrder,
        paint: true,
        linkPfep: true
      });

      this.views_.eto = new EtoView({
        model: this.model
      });

      this.views_.changes = new OrderChangesView({
        model: this.model,
        delayReasons: this.delayReasons
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.paintOrders, 'reset', this.onPaintOrdersReset);
      this.listenTo(this.views_.documents, 'documentOpened', this.onDocumentOpened);
      this.listenTo(this.views_.documents, 'documentClosed', this.onDocumentClosed);
      this.listenTo(this.views_.components, 'bestDocumentRequested', this.onBestDocumentRequested);
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.fapEntries ? fapDictionaries.load() : null,
        this.fapEntries ? this.fapEntries.fetch({reset: true}) : null,
        this.downtimes ? this.downtimes.fetch({reset: true}) : null,
        this.childOrders.fetch({reset: true}),
        this.paintOrders ? this.paintOrders.fetch({reset: true}) : null,
        this.delayReasons.isEmpty() ? this.delayReasons.fetch({reset: true}) : null
      );
    },

    afterRender: function()
    {
      delayReasonsStorage.acquire();

      if (this.fapEntries)
      {
        fapDictionaries.load();
      }

      this.renderJumpList();
      this.renderPanelToggles();
    },

    onOrderUpdated: function(message)
    {
      var order = this.model;

      if (order.id !== message._id || !message.change)
      {
        return;
      }

      var attrs = {};
      var changes = order.get('changes');

      if (!Array.isArray(changes))
      {
        attrs.changes = changes = [];
      }

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

      changes.push(message.change);
      order.set(attrs);
      order.trigger('push:change', message.change);
      this.renderPanelToggles();
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
      var page = this;

      page.$id('jumpList').remove();

      var $jumpList = page.renderPartial(jumpListTemplate);

      $jumpList.find('[data-section]').each(function()
      {
        var $section = page.$('.orders-' + this.dataset.section).first();

        if (!$section.length || $section.hasClass('hidden'))
        {
          this.parentNode.removeChild(this);
        }
      });

      page.$el.append($jumpList);
    },

    renderPanelToggles: function()
    {
      if (embedded.isEnabled())
      {
        return;
      }

      var page = this;
      var panelToggles = JSON.parse(localStorage.getItem('WMES_ORDERS_PANEL_TOGGLES') || '{}');

      page.getViews().forEach(function(view)
      {
        if (view === page.views_.changes)
        {
          return;
        }

        var $scrollable = view.$('.table-responsive');

        if (!$scrollable.length)
        {
          return;
        }

        var $panel = $scrollable.closest('.panel');
        var panelId = $panel.attr('class').match(/orders-([a-zA-Z]+)/)[1];
        var $hd = $panel.find('.panel-heading');
        var $tbody = $scrollable.find('tbody');

        $panel.attr('data-id', panelId);

        if (!$panel.hasClass('is-with-actions'))
        {
          var title = $hd.text();

          $hd.html('<div class="panel-heading-title"></div><div class="panel-heading-actions"></div>');
          $hd.find('.panel-heading-title').text(title);

          $panel.addClass('is-with-actions');
        }

        var $actions = $hd.find('.panel-heading-actions');
        var $action = $actions.find('.btn[data-action="togglePanel"]');
        var expanded = panelToggles[panelId] === true;

        $panel.toggleClass('is-expanded', expanded);

        if ($tbody[0].childElementCount > 10)
        {
          if (!$action.length)
          {
            $action = $('<button class="btn btn-default" type="button" data-action="togglePanel">'
              + '<i class="fa fa-expand"></i></button>');

            $action.appendTo($actions);
          }

          $action.toggleClass('active', expanded);
        }
        else
        {
          $action.remove();
        }
      });
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
      this.views_.components.markDocument(nc15, win);
    },

    onDocumentClosed: function(nc15, win)
    {
      this.views_.components.unmarkDocument(nc15, win);
    },

    onBestDocumentRequested: function(item, contents)
    {
      this.views_.documents.openBestDocument(item, contents);
    }

  });
});
