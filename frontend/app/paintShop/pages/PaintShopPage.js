// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/getShiftStartInfo',
  'app/core/util/html2pdf',
  'app/core/util/embedded',
  'app/core/util/pageActions',
  'app/data/clipboard',
  'app/production/views/VkbView',
  'app/printers/views/PrinterPickerView',
  'app/planning/util/contextMenu',
  'app/wmes-drilling/DrillingOrderCollection',
  'app/wmes-drilling/DrillingOrder',
  'app/wh/WhOrderCollection',
  'app/paintShopPaints/PaintShopPaintCollection',
  '../PaintShopOrder',
  '../PaintShopOrderCollection',
  '../PaintShopDropZoneCollection',
  '../PaintShopSettingCollection',
  '../views/PaintShopQueueView',
  '../views/PaintShopListView',
  '../views/PaintShopDatePickerView',
  '../views/PaintShopPaintPickerView',
  '../views/UserPickerView',
  '../views/PlanExecutionExportView',
  'app/paintShop/templates/page',
  'app/paintShop/templates/mrpTabs',
  'app/paintShop/templates/totals',
  'app/paintShop/templates/printPage',
  'app/paintShop/templates/userPageAction'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  bindLoadingMessage,
  getShiftStartInfo,
  html2pdf,
  embedded,
  pageActions,
  clipboard,
  VkbView,
  PrinterPickerView,
  contextMenu,
  DrillingOrderCollection,
  DrillingOrder,
  WhOrderCollection,
  PaintShopPaintCollection,
  PaintShopOrder,
  PaintShopOrderCollection,
  PaintShopDropZoneCollection,
  PaintShopSettingCollection,
  PaintShopQueueView,
  PaintShopListView,
  PaintShopDatePickerView,
  PaintShopPaintPickerView,
  UserPickerView,
  PlanExecutionExportView,
  pageTemplate,
  mrpTabsTemplate,
  totalsTemplate,
  printPageTemplate,
  userPageActionTemplate
) {
  'use strict';

  var STATUS_WEIGHTS = {
    started: 1,
    partial: 2,
    finished: 3,
    delivered: 4
  };

  var ORDER_DOCUMENT_PREVIEW_WINDOW = null;

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    pageId: 'paintShop',

    modelProperty: 'orders',

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMB:base'),
        {
          href: '#paintShop/' + this.orders.getDateFilter(),
          label: this.orders.getDateFilter('L'),
          template: function(breadcrumb)
          {
            return '<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a>'
              + '<a href="' + breadcrumb.href + '" data-action="showPicker">' + breadcrumb.label + '</a>'
              + '<a class="fa fa-chevron-right" data-action="next"></a></span>';
          }
        }
      ];
    },

    actions: function()
    {
      var page = this;
      var actions = [];
      var documentsAction = {
        id: page.idPrefix + '-documentsAction',
        icon: 'file-o',
        label: page.t('PAGE_ACTION:openDocument'),
        callback: function() { page.showDocumentsMenu(page.settings.getValue('documents', [])); },
        visible: page.settings.getValue('documents', []).length > 0
      };

      if (embedded.isEnabled())
      {
        actions.push(documentsAction, {
          id: 'user',
          template: function()
          {
            return page.renderPartialHtml(userPageActionTemplate, {
              signedIn: !!page.orders.user,
              user: page.orders.user
            });
          },
          afterRender: function($action)
          {
            $action.find('.is-clickable').on('click', page.showUserPickerDialog.bind(page));
          }
        });
      }
      else
      {
        actions.push({
          type: 'link',
          icon: 'arrows-alt',
          callback: page.toggleFullscreen.bind(page)
        }, documentsAction, {
          icon: 'download',
          privileges: 'PAINT_SHOP:VIEW',
          label: page.t('PAGE_ACTION:exportPlanExecution'),
          callback: page.exportPlanExecution.bind(page)
        }, {
          label: page.t('PAGE_ACTION:drilling'),
          icon: 'circle-o',
          privileges: 'DRILLING:VIEW',
          href: '#drilling/' + page.orders.getDateFilter()
        }, {
          icon: 'balance-scale',
          href: '#paintShop/load/monitoring',
          privileges: 'PAINT_SHOP:VIEW',
          label: page.t('PAGE_ACTION:load'),
          callback: function() { window.WMES_LAST_PAINT_SHOP_DATE = page.orders.getDateFilter(); }
        }, {
          icon: 'paint-brush',
          href: '#paintShop/paints',
          privileges: 'PAINT_SHOP:MANAGE',
          label: page.t('PAGE_ACTION:paints'),
          callback: function() { window.WMES_LAST_PAINT_SHOP_DATE = page.orders.getDateFilter(); }
        }, {
          icon: 'ban',
          href: '#paintShop/ignoredComponents',
          privileges: 'PAINT_SHOP:MANAGE',
          label: page.t('PAGE_ACTION:ignoredComponents'),
          callback: function() { window.WMES_LAST_PAINT_SHOP_DATE = page.orders.getDateFilter(); }
        }, {
          href: '#paintShop;settings?tab=planning',
          icon: 'cogs',
          label: page.t('PAGE_ACTION:settings'),
          privileges: 'PAINT_SHOP:MANAGE'
        });
      }

      return actions;
    },

    localTopics: {
      'socket.connected': function()
      {
        this.$el.removeClass('paintShop-is-disconnected');
      },
      'socket.disconnected': function()
      {
        this.$el.addClass('paintShop-is-disconnected');
      }
    },

    remoteTopics: {
      'paintShop.orders.changed.*': function(message)
      {
        var currentDate = this.orders.getDateFilter();
        var importedDate = time.utc.format(message.date, 'YYYY-MM-DD');

        if (importedDate === currentDate)
        {
          this.orders.applyChanges(message.changes);
        }
      },
      'paintShop.orders.updated.*': function(changes)
      {
        var order = this.orders.get(changes._id);

        if (order)
        {
          order.set(PaintShopOrder.parse(changes));

          if (changes.qtyDlv != null
            || changes.qtyPaint != null
            || changes.status != null)
          {
            this.orders.recountTotals();
          }
        }
      },
      'paintShop.dropZones.updated.*': function(message)
      {
        this.dropZones.updated(message);
      },
      'paintShop.paints.added': function(message)
      {
        this.paints.add(message.model);
      },
      'paintShop.paints.edited': function(message)
      {
        var paint = this.paints.get(message.model._id);

        if (paint)
        {
          paint.set(message.model);
        }
      },
      'paintShop.paints.deleted': function(message)
      {
        this.paints.remove(message.model._id);
      },
      'drilling.orders.changed.*': function(message)
      {
        var currentDate = this.drillingOrders.getDateFilter();
        var importedDate = time.utc.format(message.date, 'YYYY-MM-DD');

        if (importedDate === currentDate)
        {
          this.drillingOrders.applyChanges(message.changes);
        }
      },
      'drilling.orders.updated.*': function(changes)
      {
        var order = this.drillingOrders.get(changes._id);

        if (order)
        {
          order.set(DrillingOrder.parse(changes));
        }
      },
      'old.wh.orders.changed.*': function(message)
      {
        var currentDate = this.whOrders.getDateFilter();
        var importedDate = time.utc.format(message.date, 'YYYY-MM-DD');

        if (importedDate === currentDate)
        {
          this.promised(this.whOrders.fetch({reset: true}));
        }
      },
      'old.wh.orders.updated': function(message)
      {
        this.whOrders.update(message.updated);
      },
      'orderDocuments.tree.fileAdded': function(message)
      {
        var page = this;

        message.file.folders.forEach(function(folderId)
        {
          delete page.folderToDocuments[folderId];
        });
      },
      'orderDocuments.tree.fileEdited': function(message)
      {
        var page = this;

        message.file.folders.forEach(function(folderId)
        {
          delete page.folderToDocuments[folderId];
        });

        message.file.oldFolders.forEach(function(folderId)
        {
          delete page.folderToDocuments[folderId];
        });
      },
      'orderDocuments.tree.fileRemoved': function(message)
      {
        var page = this;

        message.file.oldFolders.forEach(function(folderId)
        {
          delete page.folderToDocuments[folderId];
        });
      }
    },

    events: {
      'mousedown .paintShop-tab': function(e)
      {
        if (e.button !== 0)
        {
          return;
        }

        if (this.timers.showMrpMenu)
        {
          clearTimeout(this.timers.showMrpMenu);
        }

        this.timers.showMrpMenu = setTimeout(this.showMrpMenu.bind(this, e), 300);
      },
      'click .paintShop-tab-paint': function()
      {
        if (this.timers.showMrpMenu)
        {
          clearTimeout(this.timers.showMrpMenu);
          this.timers.showMrpMenu = null;

          this.showPaintPickerDialog();
        }
      },
      'click .paintShop-tab[data-mrp]': function(e)
      {
        if (this.timers.showMrpMenu)
        {
          clearTimeout(this.timers.showMrpMenu);
          this.timers.showMrpMenu = null;

          this.orders.selectMrp(e.currentTarget.dataset.mrp);
        }
      },
      'contextmenu .paintShop-tab': function(e)
      {
        this.showMrpMenu(e);

        return false;
      },
      'focus #-search': function(e)
      {
        if (this.vkbView)
        {
          clearTimeout(this.timers.hideVkb);

          this.vkbView.show(e.target, this.onVkbValueChange);
          this.vkbView.$el.css({
            left: '195px',
            bottom: '67px',
            marginLeft: '0'
          });
        }
      },
      'blur #-search': function()
      {
        if (this.vkbView)
        {
          this.scheduleHideVkb();
        }
      },
      'input #-search': 'onVkbValueChange'
    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 30);
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.folderToDocuments = {};

      this.defineModels();
      this.defineViews();
      this.once('afterRender', this.defineBindings);

      this.setView('#-queue', this.queueView);
      this.setView('#-todo', this.todoView);
      this.setView('#-done', this.doneView);

      if (embedded.isEnabled())
      {
        this.setView('#-vkb', this.vkbView);
      }
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      this.hideMenu();

      $('.modal').addClass('fade');

      $(document.body)
        .css('overflow', '')
        .removeClass('paintShop-is-fullscreen');

      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);

      if (this.orderDetailsWindow)
      {
        this.orderDetailsWindow.close();
        this.orderDetailsWindow = null;
      }

      if (ORDER_DOCUMENT_PREVIEW_WINDOW)
      {
        ORDER_DOCUMENT_PREVIEW_WINDOW.close();
        ORDER_DOCUMENT_PREVIEW_WINDOW = null;
      }
    },

    defineModels: function()
    {
      var page = this;

      page.settings = bindLoadingMessage(new PaintShopSettingCollection(null, {pubsub: page.pubsub}), page);

      page.paints = bindLoadingMessage(
        new PaintShopPaintCollection(null, {rqlQuery: 'limit(0)'}),
        page
      );

      page.dropZones = bindLoadingMessage(
        PaintShopDropZoneCollection.forDate(page.options.date),
        page
      );

      page.drillingOrders = bindLoadingMessage(DrillingOrderCollection.forDate(page.options.date), page);

      page.whOrders = bindLoadingMessage(
        new WhOrderCollection(null, {
          date: page.options.date,
          groupByOrderNo: true
        }),
        page
      );

      page.orders = bindLoadingMessage(PaintShopOrderCollection.forDate(page.options.date, {
        selectedMrp: page.options.selectedMrp || 'all',
        selectedPaint: page.options.selectedPaint || 'all',
        settings: page.settings,
        paints: page.paints,
        dropZones: page.dropZones,
        user: JSON.parse(sessionStorage.getItem('WMES_PS_USER') || 'null'),
        drillingOrders: page.drillingOrders,
        whOrders: page.whOrders
      }), page);
    },

    defineViews: function()
    {
      this.vkbView = embedded.isEnabled() ? new VkbView() : null;
      this.todoView = new PaintShopListView({
        model: this.orders,
        showTimes: false,
        showSearch: true,
        showTotals: false,
        vkb: this.vkbView,
        filter: function(psOrder)
        {
          return psOrder.status === 'new'
            || psOrder.status === 'aside'
            || psOrder.status === 'cancelled';
        }
      });
      this.doneView = new PaintShopListView({
        model: this.orders,
        showTimes: true,
        showSearch: false,
        showTotals: true,
        filter: function(psOrder)
        {
          return STATUS_WEIGHTS[psOrder.status] >= 1;
        },
        sort: function(a, b)
        {
          if ((a.status === 'started' && b.status === 'started')
            || (a.status === 'partial' && b.status === 'partial'))
          {
            return a.startedAt - b.startedAt;
          }

          if (a.status !== b.status)
          {
            return STATUS_WEIGHTS[a.status] - STATUS_WEIGHTS[b.status];
          }

          return b.startedAt - a.startedAt;
        }
      });
      this.queueView = new PaintShopQueueView({
        orders: this.orders,
        dropZones: this.dropZones,
        vkb: this.vkbView,
        embedded: embedded.isEnabled()
      });
    },

    defineBindings: function()
    {
      var page = this;
      var idPrefix = page.idPrefix;

      page.listenTo(page.orders, 'reset', page.onOrdersReset);
      page.listenTo(page.orders, 'mrpSelected', page.onMrpSelected);
      page.listenTo(page.orders, 'paintSelected', page.onPaintSelected);
      page.listenTo(page.orders, 'totalsRecounted', page.renderTotals);

      page.listenTo(page.dropZones, 'reset', page.renderTabs);
      page.listenTo(page.dropZones, 'updated', page.onDropZoneUpdated);

      page.listenTo(page.paints, 'add change remove', page.onPaintUpdated);

      page.listenTo(page.queueView, 'actionRequested', page.onActionRequested);

      page.listenTo(page.settings, 'change', page.onSettingChanged);

      $(document)
        .on('click.' + idPrefix, '.paintShop-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window)
        .on('resize.' + idPrefix, page.onResize);
    },

    load: function(when)
    {
      var page = this;
      var deferred = $.Deferred();

      var load1 = $.when(
        page.settings.fetch({reset: true}),
        page.dropZones.fetch({reset: true}),
        page.paints.fetch({reset: true}),
        page.drillingOrders.fetch({reset: true}),
        page.whOrders.fetch({reset: true})
      );

      load1.fail(function() { deferred.reject.apply(deferred, arguments); });

      load1.done(function()
      {
        var load2 = page.promised(page.orders.fetch());

        load2.fail(function() { deferred.reject.apply(deferred, arguments); });

        load2.done(function() { deferred.resolve(); });
      });

      return when(deferred.promise());
    },

    getTemplateData: function()
    {
      this.orders.serialize();

      return {
        embedded: embedded.isEnabled(),
        height: this.calcInitialHeight() + 'px',
        renderTabs: mrpTabsTemplate,
        renderTotals: this.renderPartialHtml.bind(this, totalsTemplate),
        tabs: this.serializeTabs(),
        totals: this.serializeTotals(),
        selectedPaint: {
          label: this.getSelectedPaintLabel(),
          dropped: this.isSelectedPaintDropped()
        }
      };
    },

    serializeTabs: function()
    {
      var page = this;
      var orders = page.orders;
      var dropZones = page.dropZones;

      return ['all'].concat(orders.allMrps || []).map(function(mrp)
      {
        return {
          mrp: mrp,
          label: mrp,
          description: t.has('paintShop', 'mrp:' + mrp) ? page.t('mrp:' + mrp) : '',
          active: orders.selectedMrp === mrp,
          dropZone: dropZones.getState(mrp)
        };
      });
    },

    serializeTotals: function()
    {
      return this.orders.serializeTotals();
    },

    beforeRender: function()
    {
      document.body.style.overflow = 'hidden';
      document.body.classList.toggle('paintShop-is-fullscreen', this.isFullscreen());
    },

    afterRender: function()
    {
      this.$id('todo').on('scroll', this.todoView.onScroll.bind(this.todoView));
      this.$id('queue').on('scroll', this.queueView.onScroll.bind(this.queueView));
      this.$id('done').on('scroll', this.doneView.onScroll.bind(this.doneView));

      $('.modal.fade').removeClass('fade');

      this.resize();
      this.toggleTabs();

      embedded.render(this);
      embedded.ready();
    },

    resize: function()
    {
      this.el.style.height = this.calcHeight() + 'px';
    },

    isFullscreen: function()
    {
      return embedded.isEnabled()
        || this.options.fullscreen
        || window.innerWidth <= 800
        || (window.outerWidth === window.screen.width && window.outerHeight === window.screen.height);
    },

    calcInitialHeight: function()
    {
      var height = window.innerHeight - 15;

      if (this.isFullscreen())
      {
        height -= 34 + 30;
      }
      else
      {
        height -= 87 + 64;
      }

      return height;
    },

    calcHeight: function()
    {
      var fullscreen = this.isFullscreen();
      var height = window.innerHeight - 15;

      document.body.classList.toggle('paintShop-is-fullscreen', fullscreen);

      if (fullscreen)
      {
        height -= $('.hd').outerHeight(true) + 30;
      }
      else
      {
        height -= $('.hd').outerHeight(true) + $('.ft').outerHeight(true);
      }

      return height;
    },

    toggleFullscreen: function()
    {
      this.options.fullscreen = !this.options.fullscreen;

      this.updateUrl();
      this.resize();
    },

    exportPlanExecution: function()
    {
      var dialogView = new PlanExecutionExportView({
        model: this.orders
      });

      viewport.showDialog(dialogView, this.t('planExecutionExport:title'));
    },

    renderTabs: function()
    {
      this.$id('tabs').html(mrpTabsTemplate({
        tabs: this.serializeTabs()
      }));
    },

    renderTotals: function()
    {
      this.$id('totals').html(this.renderPartialHtml(totalsTemplate, {
        totals: this.serializeTotals()
      }));
    },

    updateUrl: function()
    {
      if (!embedded.isEnabled())
      {
        this.broker.publish('router.navigate', {
          url: this.genClientUrl(),
          trigger: false,
          replace: true
        });
      }
    },

    genClientUrl: function()
    {
      var query = [];

      if (this.orders.selectedMrp !== 'all')
      {
        query.push('mrp=' + this.orders.selectedMrp);
      }

      if (this.orders.selectedPaint !== 'all')
      {
        query.push('paint=' + this.orders.selectedPaint);
      }

      if (this.options.fullscreen)
      {
        query.push('fullscreen=1');
      }

      return this.orders.genClientUrl() + (query.length ? '?' : '') + query.join('&');
    },

    showMrpMenu: function(e)
    {
      if (this.timers.showMrpMenu)
      {
        clearTimeout(this.timers.showMrpMenu);
        this.timers.showMrpMenu = null;
      }

      var mrp = e.currentTarget.dataset.mrp || null;
      var drilling = this.orders.isDrillingMrp(mrp);

      if (drilling || mrp === 'all')
      {
        mrp = null;
      }

      var isEmbedded = embedded.isEnabled();
      var actionOptions = {
        filterProperty: drilling || !mrp ? null : 'mrp',
        filterValue: mrp,
        drilling: drilling
      };
      var menu = [
        this.t('menu:header:' + (mrp ? 'mrp' : 'all'), {mrp: mrp}),
        {
          icon: 'fa-clipboard',
          label: this.t('menu:copyOrders'),
          handler: this.handleCopyOrdersAction.bind(this, e, actionOptions),
          visible: !isEmbedded
        },
        {
          icon: 'fa-clipboard',
          label: this.t('menu:copyChildOrders'),
          handler: this.handleCopyChildOrdersAction.bind(this, e, actionOptions),
          visible: !isEmbedded
        },
        {
          icon: 'fa-print',
          label: this.t('menu:printOrders'),
          handler: this.handlePrintOrdersAction.bind(this, actionOptions)
        },
        {
          icon: 'fa-download',
          label: this.t('menu:exportOrders'),
          handler: this.handleExportOrdersAction.bind(this, actionOptions),
          visible: !isEmbedded
        }
      ];

      if (!mrp && !drilling)
      {
        menu.push({
          label: this.t('menu:exportPaints'),
          handler: this.handleExportPaintsAction.bind(this, mrp),
          visible: !isEmbedded
        });
      }

      if (user.isAllowedTo('PAINT_SHOP:DROP_ZONES'))
      {
        if (mrp)
        {
          menu.push({
            icon: 'fa-level-down',
            label: this.t('menu:dropZone:' + this.dropZones.getState(mrp)),
            handler: this.handleDropZoneAction.bind(this, mrp, false)
          });
        }
        else if (this.orders.selectedPaint !== 'all')
        {
          menu.push({
            icon: 'fa-level-down',
            label: this.t('menu:dropZone:' + this.dropZones.getState(this.orders.selectedPaint)),
            handler: this.handleDropZoneAction.bind(this, this.orders.selectedPaint, true)
          });
        }
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    handleOpenOrderAction: function(options)
    {
      var page = this;
      var url = '/#orders/' + options.orderNo;

      if (!embedded.isEnabled())
      {
        window.open(url);

        return;
      }

      if (page.orderDetailsWindow && !page.orderDetailsWindow.closed)
      {
        page.orderDetailsWindow.location.href = url;
        page.orderDetailsWindow.focus();

        return;
      }

      var width = Math.min(window.screen.availWidth - 200, 1500);
      var height = Math.min(window.screen.availHeight - 160, 800);
      var left = window.screen.availWidth - width - 80;

      var win = window.open(
        '/#orders/' + options.orderNo,
        'WMES_ORDER_DETAILS',
        'top=80,left=' + left + ',width=' + width + ',height=' + height
      );

      if (!win)
      {
        return;
      }

      win.onPageShown = function()
      {
        if (!win || win.closed)
        {
          return;
        }

        win.focus();

        page.orderDetailsWindow = win;
      };

      win.onfocus = function()
      {
        clearTimeout(page.timers.closeOrderDetails);
      };

      win.onblur = function()
      {
        page.timers.closeOrderDetails = setTimeout(function()
        {
          if (page.orderDetailsWindow)
          {
            page.orderDetailsWindow.close();
            page.orderDetailsWindow = null;
          }
        }, 30000);
      };

      win.focus();
    },

    handleCopyOrdersAction: function(e, options)
    {
      var page = this;
      var filterProperty = options.filterProperty;
      var filterValue = options.filterValue;
      var drilling = options.drilling;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var text = [];
        var usedOrders = {};

        page.orders.serialize().forEach(function(order)
        {
          if (drilling && !order.drilling)
          {
            return;
          }

          var orderNo = order.order;

          if (filterProperty === 'order')
          {
            if (orderNo !== filterValue)
            {
              return;
            }
          }
          else
          {
            if (order.status === 'cancelled')
            {
              return;
            }

            if (filterProperty === 'mrp' && order.mrp !== filterValue)
            {
              return;
            }

            if (!page.orders.isPaintVisible(order))
            {
              return;
            }
          }

          if (usedOrders[orderNo])
          {
            return;
          }

          text.push(orderNo);

          usedOrders[orderNo] = true;
        });

        clipboardData.setData('text/plain', text.join('\r\n'));
        clipboard.showTooltip({e: e, text: page.t('menu:copyOrders:success')});
      });
    },

    handleCopyChildOrdersAction: function(e, options)
    {
      var page = this;
      var filterProperty = options.filterProperty;
      var filterValue = options.filterValue;
      var drilling = options.drilling;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var text = [];

        page.orders.serialize().forEach(function(order)
        {
          if (drilling && !order.drilling)
          {
            return;
          }

          var orderNo = order.order;

          if (filterProperty === 'order')
          {
            if (orderNo !== filterValue)
            {
              return;
            }
          }
          else
          {
            if (order.status === 'cancelled')
            {
              return;
            }

            if (filterProperty === 'mrp' && order.mrp !== filterValue)
            {
              return;
            }

            if (!page.orders.isPaintVisible(order))
            {
              return;
            }
          }

          order.childOrders.forEach(function(childOrder)
          {
            if (page.orders.isPaintVisible(childOrder))
            {
              text.push(childOrder.order);
            }
          });
        });

        clipboardData.setData('text/plain', text.join('\r\n'));
        clipboard.showTooltip({e: e, text: page.t('menu:copyChildOrders:success')});
      });
    },

    handlePrintOrdersAction: function(options, e)
    {
      var page = this;
      var filterProperty = options.filterProperty;
      var filterValue = options.filterValue;
      var drilling = options.drilling;

      e.contextMenu.tag = 'paintShop';

      PrinterPickerView.contextMenu(e, function(printer)
      {
        var orders = page.orders.filter(function(order)
        {
          if (order.get('status') === 'cancelled')
          {
            return false;
          }

          var serializedOrder = order.serialize();

          if (drilling && !serializedOrder.drilling)
          {
            return false;
          }

          if (!page.orders.isPaintVisible(serializedOrder))
          {
            return false;
          }

          return !filterValue || order.get(filterProperty) === filterValue;
        });

        if (!orders.length)
        {
          return;
        }

        var html = page.renderPartialHtml(printPageTemplate, {
          drilling: drilling,
          date: +page.orders.getDateFilter('x'),
          mrp: !filterValue ? null : filterProperty === 'order' ? orders[0].get('mrp') : filterValue,
          orderNo: filterProperty === 'order' ? filterValue : null,
          pages: page.serializePrintPages(orders)
        });

        html2pdf(html, printer);
      });
    },

    handleExportOrdersAction: function(options)
    {
      var url = '/paintShop/orders;export.xlsx?sort(date,no)&limit(0)&date=' + this.orders.getDateFilter();

      if (options.filterProperty === 'mrp')
      {
        url += '&mrp=' + options.filterValue;
      }

      var selectedPaint = this.orders.selectedPaint;
      var mspPaints = (this.settings.getValue('mspPaints') || [])
        .map(function(nc12) { return 'string:' + nc12; })
        .join(',');

      if (options.drilling)
      {
        url += '&paint.nc12=000000000000';
      }
      else if (selectedPaint === 'msp' && mspPaints.length)
      {
        url += '&childOrders.components.nc12=in=(' + mspPaints + ')';
      }
      else if (selectedPaint !== 'all')
      {
        url += '&childOrders.components.nc12=string:' + selectedPaint;
      }

      pageActions.exportXlsx(url);
    },

    handleExportPaintsAction: function()
    {
      var $msg = viewport.msg.show({
        type: 'warning',
        text: t('core', 'MSG:EXPORTING')
      });

      var paintPickerView = new PaintShopPaintPickerView({
        orders: this.orders,
        dropZones: this.dropZones
      });

      var req = this.ajax({
        method: 'POST',
        url: '/xlsxExporter',
        data: JSON.stringify({
          filename: 'WMES-PAINT_SHOP-PAINTS',
          freezeRows: 1,
          freezeColumns: 1,
          columns: {
            nc12: 13,
            name: 40,
            weight: {type: 'integer', width: 8},
            manHours: {type: 'decimal', width: 6},
            dropZone: 'boolean',
            pending: 'integer',
            started1: 'integer',
            started2: 'integer',
            partial: 'integer',
            finished: 'integer',
            delivered: 'integer',
            aside: 'integer',
            cancelled: 'integer'
          },
          data: paintPickerView.serialize().paints.map(function(paint)
          {
            return {
              nc12: paint.nc12,
              name: paint.name,
              weight: paint.weight,
              manHours: paint.manHours,
              dropZone: paint.dropped,
              pending: paint.totals.new,
              started1: paint.totals.started1,
              started2: paint.totals.started2,
              partial: paint.totals.partial,
              finished: paint.totals.finished,
              delivered: paint.totals.delivered,
              aside: paint.totals.aside,
              cancelled: paint.totals.cancelled
            };
          })
        })
      });

      req.fail(function()
      {
        viewport.msg.hide($msg, true);

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('core', 'MSG:EXPORTING_FAILURE')
        });
      });

      req.done(function(id)
      {
        viewport.msg.hide($msg, true);

        pageActions.exportXlsx('/xlsxExporter/' + id);
      });
    },

    handleDropZoneAction: function(mrp, isPaint)
    {
      var page = this;
      var $tab;
      var $icon;

      if (isPaint)
      {
        $tab = page.$('.paintShop-tab-paint');
        $icon = $tab.find('.fa-paint-brush').first().removeClass('fa-paint-brush').addClass('fa-spinner fa-spin');
      }
      else
      {
        $tab = page.$('.paintShop-tab[data-mrp="' + mrp + '"]').addClass('is-loading');
        $icon = $tab.find('.fa').removeClass('fa-level-down').addClass('fa-spinner fa-spin');
      }

      var req = page.promised(page.dropZones.toggle(mrp));

      req.fail(function()
      {
        $tab.toggleClass('is-dropped', page.dropZones.getState(mrp));

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: page.t('menu:dropZone:failure')
        });
      });

      req.done(function(res)
      {
        $tab.toggleClass('is-dropped', res.state);
      });

      req.always(function()
      {
        $icon.removeClass('fa-spinner fa-spin').addClass(isPaint ? 'fa-paint-brush' : 'fa-level-down');
        $tab.removeClass('is-loading');
      });

      this.dropZones.updated({
        _id: {
          date: this.dropZones.date,
          mrp: mrp
        },
        state: !this.dropZones.getState(mrp)
      });
    },

    getSelectedPaintLabel: function()
    {
      var paint = this.orders.selectedPaint;

      return t.has('paintShop', 'tabs:paint:' + paint) ? this.t('tabs:paint:' + paint) : paint;
    },

    isSelectedPaintDropped: function()
    {
      return this.dropZones.getState(this.orders.selectedPaint);
    },

    serializePrintPages: function(orders)
    {
      var pages = [{rows: []}];
      var push = function(row)
      {
        var page = pages[pages.length - 1];

        if (page.rows.length === 44)
        {
          pages.push({rows: [row]});
        }
        else
        {
          page.rows.push(row);
        }
      };

      orders.forEach(function(order)
      {
        push({
          type: 'order',
          no: order.get('no') + '.',
          order: order.get('order'),
          nc12: order.get('nc12'),
          qty: order.get('qty'),
          unit: 'PCE',
          name: order.get('name'),
          mrp: order.get('mrp')
        });

        order.get('childOrders').forEach(function(childOrder)
        {
          push({
            type: 'childOrder',
            no: '',
            order: childOrder.order,
            nc12: childOrder.nc12,
            qty: childOrder.qty,
            unit: 'PCE',
            name: childOrder.name,
            mrp: ''
          });

          childOrder.components.forEach(function(component)
          {
            if (PaintShopOrder.isComponentBlacklisted(component))
            {
              return;
            }

            push({
              type: 'component',
              no: '',
              order: '',
              nc12: component.nc12,
              qty: Math.ceil(component.qty),
              unit: component.unit,
              name: component.name,
              mrp: ''
            });
          });
        });
      });

      return pages;
    },

    scheduleHideVkb: function()
    {
      var page = this;

      clearTimeout(page.timers.hideVkb);

      if (!page.vkbView.isVisible())
      {
        return;
      }

      page.timers.hideVkb = setTimeout(function()
      {
        page.vkbView.hide();
        page.vkbView.$el.css({
          left: '',
          bottom: '',
          marginLeft: ''
        });

        page.$id('search').val('').addClass('is-empty').css('background', '');
      }, 250);
    },

    searchOrder: function(orderNo)
    {
      var page = this;

      if (page.vkbView)
      {
        page.vkbView.hide();
      }

      var $search = page.$id('search').blur();
      var order = page.orders.getFirstByOrderNo(orderNo);

      if (order)
      {
        $search.val('').addClass('is-empty').css('background', '');

        if (order.get('mrp') !== page.orders.selectedMrp)
        {
          page.orders.selectMrp(order.get('mrp'));
        }

        page.orders.trigger('focus', order.id, {showDetails: true});

        return;
      }

      $search.prop('disabled', true);

      viewport.msg.loading();

      var req = this.ajax({
        url: '/paintShop/orders?select(date,mrp)&limit(1)'
          + '&or(eq(order,string:' + orderNo + '),eq(childOrders.order,string:' + orderNo + '))'
      });

      req.fail(fail);

      req.done(function(res)
      {
        if (res.totalCount === 0)
        {
          return fail();
        }

        var order = res.collection[0];

        page.orders.setDateFilter(time.utc.format(order.date, 'YYYY-MM-DD'));

        var req = page.orders.fetch({reset: true});

        req.fail(fail);

        req.done(function()
        {
          if (page.orders.selectedMrp !== order.mrp)
          {
            page.orders.selectMrp(order.mrp);
          }

          page.orders.trigger('focus', order._id, {showDetails: true});

          complete('#ddffdd');
        });
      });

      req.always(function()
      {
        viewport.msg.loaded();
      });

      function fail()
      {
        viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: page.t('MSG:search:failure')
        });

        complete('#f2dede');
      }

      function complete(bgColor)
      {
        $search.css('background', bgColor);

        setTimeout(function()
        {
          $search
            .prop('disabled', false)
            .val('')
            .addClass('is-empty')
            .css('background', '')
            .focus();
        }, 1337);
      }
    },

    onVkbValueChange: function()
    {
      var $search = this.$id('search');
      var orderNo = $search.val();

      $search.toggleClass('is-empty', orderNo === '').css('background', /[^0-9]+/.test(orderNo) ? '#f2dede' : '');

      if (/^[0-9]{9}$/.test(orderNo))
      {
        this.searchOrder(orderNo);
      }
    },

    onSettingChanged: function(setting)
    {
      if (setting.id === 'paintShop.mspPaints')
      {
        this.renderTotals();
      }
    },

    onActionRequested: function(action)
    {
      switch (action)
      {
        case 'openOrder':
          action = this.handleOpenOrderAction;
          break;

        case 'copyOrders':
          action = this.handleCopyOrdersAction;
          break;

        case 'copyChildOrders':
          action = this.handleCopyChildOrdersAction;
          break;

        case 'dropZone':
          action = this.handleDropZoneAction;
          break;

        case 'printOrders':
          action = this.handlePrintOrdersAction;
          break;

        case 'exportOrders':
          action = this.handleExportOrdersAction;
          break;

        default:
          return;
      }

      action.apply(this, Array.prototype.splice.call(arguments, 1));
    },

    onOrdersReset: function()
    {
      var page = this;

      if (page.layout)
      {
        page.layout.setBreadcrumbs(page.breadcrumbs, page);
      }

      this.updateUrl();
      this.renderTabs();
      this.renderTotals();
    },

    onMrpSelected: function()
    {
      this.updateUrl();
      this.renderTotals();

      this.$('.paintShop-tab.is-active').removeClass('is-active');
      this.$('.paintShop-tab[data-mrp="' + this.orders.selectedMrp + '"]').addClass('is-active');
    },

    onPaintSelected: function()
    {
      this.updateUrl();
      this.renderTotals();
      this.toggleTabs();

      this.$id('selectedPaint')
        .toggleClass('is-dropped', this.isSelectedPaintDropped())
        .find('span')
        .text(this.getSelectedPaintLabel());
    },

    onDropZoneUpdated: function(dropZone)
    {
      var mrp = dropZone.get('mrp');
      var selector = mrp === this.orders.selectedPaint
        ? '.paintShop-tab-paint'
        : '.paintShop-tab[data-mrp="' + mrp + '"]';

      this.$(selector).toggleClass('is-dropped', dropZone.get('state'));
    },

    onPaintUpdated: function()
    {
      this.orders.serialize(true);
      this.orders.trigger('reset');
    },

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      if (e.target.classList.contains('disabled'))
      {
        return false;
      }

      if (e.target.dataset.action === 'showPicker')
      {
        this.showDatePickerDialog();
      }
      else
      {
        this.selectNonEmptyDate(e.target.dataset.action);
      }

      return false;
    },

    setDate: function(newDate)
    {
      var page = this;

      page.orders.setDateFilter(newDate);
      page.drillingOrders.setDateFilter(newDate);
      page.whOrders.setDateFilter(newDate);
      page.dropZones.setDate(page.orders.getDateFilter());

      page.orders.reset([]);
      page.drillingOrders.reset([]);
      page.whOrders.reset([]);
      page.dropZones.reset([]);

      var dropZones = page.promised(page.dropZones.fetch({reset: true}));
      var drillingOrders = page.drillingOrders.fetch({reset: true});
      var whOrders = page.whOrders.fetch({reset: true});

      $.when(dropZones, drillingOrders, whOrders).done(function()
      {
        page.promised(page.orders.fetch({reset: true}));
      });
    },

    showDatePickerDialog: function()
    {
      var dialogView = new PaintShopDatePickerView({
        model: {
          date: this.orders.getDateFilter()
        },
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(newDate)
      {
        viewport.closeDialog();

        if (newDate !== this.orders.getDateFilter())
        {
          this.setDate(newDate);
        }
      });

      viewport.showDialog(dialogView);
    },

    showPaintPickerDialog: function()
    {
      var dialogView = new PaintShopPaintPickerView({
        orders: this.orders,
        dropZones: this.dropZones,
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(newPaint)
      {
        viewport.closeDialog();

        this.orders.selectPaint(newPaint);
      });

      viewport.showDialog(dialogView);
    },

    selectNonEmptyDate: function(dir)
    {
      $('.paintShop-breadcrumb').find('a').addClass('disabled');

      var page = this;
      var date = +page.orders.getDateFilter('x');
      var month = 30 * 24 * 3600 * 1000;
      var url = '/paintShop/orders?limit(1)&select(date)';

      if (dir === 'prev')
      {
        url += '&sort(-date)&date<' + date + '&date>' + (date - month);
      }
      else
      {
        url += '&sort(date)&date>' + date + '&date<' + (date + month);
      }

      var req = page.ajax({url: url});

      req.done(function(res)
      {
        if (res.totalCount)
        {
          page.setDate(time.utc.format(res.collection[0].date, 'YYYY-MM-DD'));
        }
        else
        {
          viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: page.t('MSG:date:empty')
          });
        }
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: page.t('MSG:date:failure')
        });
      });

      req.always(function()
      {
        if (page.layout)
        {
          page.layout.setBreadcrumbs(page.breadcrumbs, page);
        }
      });
    },

    showUserPickerDialog: function()
    {
      var page = this;
      var dialogView = new UserPickerView({
        model: {
          user: page.orders.user
        }
      });

      page.listenTo(dialogView, 'picked', function(user)
      {
        if (user)
        {
          sessionStorage.setItem('WMES_PS_USER', JSON.stringify(user));
        }
        else
        {
          sessionStorage.removeItem('WMES_PS_USER');
        }

        page.orders.user = user;

        if (page.layout)
        {
          page.layout.setActions(page.actions, page);
        }

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView);
    },

    toggleTabs: function()
    {
      var page = this;
      var paint = page.orders.selectedPaint;
      var paintMrps = page.orders.paintToMrp[paint] || {};

      page.$('.paintShop-tab[data-mrp]').each(function()
      {
        var mrp = this.dataset.mrp;

        if (!mrp || mrp === 'all')
        {
          return;
        }

        this.classList.toggle('is-disabled', paint !== 'all' && !paintMrps[mrp]);
      });
    },

    showDocumentsMenu: function(documents)
    {
      var page = this;
      var rect = this.$id('documentsAction')[0].getBoundingClientRect();
      var menu = documents.map(function(item)
      {
        var isDoc = item.nc15.length === 15;

        return {
          icon: isDoc ? 'fa-file-o' : 'fa-folder-o',
          label: item.name || item.nc15,
          handler: isDoc
            ? page.openDocumentWindow.bind(page, item.nc15)
            : page.showDocumentFolder.bind(page, item.nc15),
          visible: isDoc || user.isLoggedIn()
        };
      });

      contextMenu.show(page, rect.top + rect.height + 3, rect.left, menu);
    },

    showDocumentFolder: function(folderId, e)
    {
      if (!this.folderToDocuments[folderId])
      {
        return this.loadDocumentFolder(folderId);
      }

      setTimeout(this.showDocumentsMenu.bind(this, this.folderToDocuments[folderId]), 1);
    },

    loadDocumentFolder: function(folderId)
    {
      var page = this;

      viewport.msg.loading();

      var req = page.ajax({
        url: '/orderDocuments/files?select(name)&folders=' + folderId
      });

      req.done(function(res)
      {
        viewport.msg.loaded();

        if (!res.totalCount)
        {
          return;
        }

        page.folderToDocuments[folderId] = [];

        (res.collection || []).forEach(function(file)
        {
          page.folderToDocuments[folderId].push({
            nc15: file._id,
            name: file.name
          });
        });

        contextMenu.hide(page, false);

        page.showDocumentFolder(folderId);
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });
    },

    openDocumentWindow: function(nc15)
    {
      var view = this;
      var ready = false;
      var screen = window.screen;
      var availHeight = screen.availHeight;

      if (screen.availWidth === window.innerWidth && screen.availHeight !== window.innerHeight)
      {
        availHeight *= 0.9;
      }

      var width = screen.availWidth * 0.8;
      var height = availHeight * 0.9;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.floor((availHeight - height) / 2);
      var windowFeatures = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);
      var windowName = 'WMES_ORDER_DOCUMENT_PREVIEW';
      var win = window.open('/orderDocuments/' + nc15, windowName, windowFeatures);

      if (!win)
      {
        return;
      }

      win.onfocus = function()
      {
        clearTimeout(view.timers.closeDocument);
      };

      win.onblur = function()
      {
        view.timers.closeDocument = setTimeout(function() { win.close(); }, 30000);
      };

      ORDER_DOCUMENT_PREVIEW_WINDOW = win;

      clearInterval(view.timers[windowName]);
      clearTimeout(view.timers.closeDocument);

      view.timers[windowName] = setInterval(function()
      {
        if (win.closed)
        {
          ORDER_DOCUMENT_PREVIEW_WINDOW = null;

          clearInterval(view.timers[windowName]);
          clearTimeout(view.timers.closeDocument);
        }
        else if (!ready && (win.ready || (win.document.title && win.document.title.indexOf('404') !== -1)))
        {
          ready = true;

          win.focus();
        }
      }, 250);
    }

  });
});
