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
  'app/data/clipboard',
  'app/production/views/VkbView',
  'app/planning/util/contextMenu',
  'app/paintShopPaints/PaintShopPaintCollection',
  '../PaintShopOrder',
  '../PaintShopOrderCollection',
  '../PaintShopDropZoneCollection',
  '../views/PaintShopQueueView',
  '../views/PaintShopListView',
  '../views/PaintShopDatePickerView',
  'app/paintShop/templates/page',
  'app/paintShop/templates/mrpTabs',
  'app/paintShop/templates/totals',
  'app/paintShop/templates/printPage'
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
  clipboard,
  VkbView,
  contextMenu,
  PaintShopPaintCollection,
  PaintShopOrder,
  PaintShopOrderCollection,
  PaintShopDropZoneCollection,
  PaintShopQueueView,
  PaintShopListView,
  PaintShopDatePickerView,
  pageTemplate,
  mrpTabsTemplate,
  totalsTemplate,
  printPageTemplate
) {
  'use strict';

  var IS_EMBEDDED = window.parent !== window;
  var STATUS_WEIGHTS = {
    started: 1,
    partial: 2,
    finished: 3
  };

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    pageId: 'paintShop',

    breadcrumbs: function()
    {
      return [
        t.bound('paintShop', 'BREADCRUMBS:base'),
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
      var actions = [];

      if (!IS_EMBEDDED)
      {
        actions.push({
          type: 'link',
          icon: 'arrows-alt',
          callback: this.toggleFullscreen.bind(this)
        }, {
          icon: 'paint-brush',
          href: '#paintShop/paints',
          privileges: 'PAINT_SHOP:MANAGE',
          label: t('paintShop', 'PAGE_ACTIONS:paints')
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

          if (changes.qtyPaint || changes.status)
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
      }
    },

    events: {
      'click .paintShop-tab[data-mrp]': function(e)
      {
        this.orders.selectMrp(e.currentTarget.dataset.mrp);
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
      'input #-search': 'onVkbValueChange',

      'mousedown #-switchApps': function(e) { this.startActionTimer('switchApps', e); },
      'touchstart #-switchApps': function() { this.startActionTimer('switchApps'); },
      'mouseup #-switchApps': function() { this.stopActionTimer('switchApps'); },
      'touchend #-switchApps': function() { this.stopActionTimer('switchApps'); },

      'mousedown #-reboot': function(e) { this.startActionTimer('reboot', e); },
      'touchstart #-reboot': function() { this.startActionTimer('reboot'); },
      'mouseup #-reboot': function() { this.stopActionTimer('reboot'); },
      'touchend #-reboot': function() { this.stopActionTimer('reboot'); },

      'mousedown #-shutdown': function(e) { this.startActionTimer('shutdown', e); },
      'touchstart #-shutdown': function() { this.startActionTimer('shutdown'); },
      'mouseup #-shutdown': function() { this.stopActionTimer('shutdown'); },
      'touchend #-shutdown': function() { this.stopActionTimer('shutdown'); }
    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 30);
      this.onVkbValueChange = this.onVkbValueChange.bind(this);

      this.actionTimer = {
        action: null,
        time: null
      };

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-queue', this.queueView);
      this.setView('#-todo', this.todoView);
      this.setView('#-done', this.doneView);

      if (IS_EMBEDDED)
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
        .removeClass('paintShop-is-fullscreen paintShop-is-embedded');

      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.paints = bindLoadingMessage(
        new PaintShopPaintCollection(null, {rqlQuery: 'limit(0)'}),
        this,
        'MSG:LOADING_FAILURE:paints'
      );
      this.orders = bindLoadingMessage(PaintShopOrderCollection.forDate(this.options.date, {
        selectedMrp: this.options.selectedMrp || 'all',
        paints: this.paints
      }), this);
      this.dropZones = bindLoadingMessage(
        PaintShopDropZoneCollection.forDate(this.options.date),
        this,
        'MSG:LOADING_FAILURE:dropZones'
      );
    },

    defineViews: function()
    {
      this.vkbView = IS_EMBEDDED ? new VkbView() : null;
      this.queueView = new PaintShopQueueView({
        orders: this.orders,
        dropZones: this.dropZones,
        vkb: this.vkbView
      });
      this.todoView = new PaintShopListView({
        model: this.orders,
        showTimes: false,
        showSearch: true,
        showTotals: false,
        vkb: this.vkbView,
        filter: function(psOrder)
        {
          return psOrder.status === 'new' || psOrder.status === 'cancelled';
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
    },

    defineBindings: function()
    {
      var page = this;
      var idPrefix = page.idPrefix;

      page.listenTo(page.orders, 'reset', _.after(2, this.onOrdersReset));
      page.listenTo(page.orders, 'mrpSelected', this.onMrpSelected);
      page.listenTo(page.orders, 'totalsRecounted', this.renderTotals);

      page.listenTo(page.dropZones, 'reset', _.after(2, this.renderTabs));
      page.listenTo(page.dropZones, 'updated', this.onDropZoneUpdated);

      page.listenTo(page.paints, 'add change remove', this.onPaintUpdated);

      page.listenTo(page.queueView, 'actionRequested', this.onActionRequested);

      $(document)
        .on('click.' + idPrefix, '.paintShop-breadcrumb', this.onBreadcrumbsClick.bind(this));

      $(window)
        .on('resize.' + idPrefix, this.onResize);

      page.once('afterRender', function()
      {
        if (IS_EMBEDDED)
        {
          window.parent.postMessage({type: 'ready', app: 'paintShop'}, '*');
        }

        page.onOrdersReset();
      });
    },

    load: function(when)
    {
      return when(
        this.orders.fetch({reset: true}),
        this.dropZones.fetch({reset: true}),
        this.paints.fetch({reset: true})
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        embedded: IS_EMBEDDED,
        height: this.calcInitialHeight() + 'px',
        renderTabs: mrpTabsTemplate,
        renderTotals: totalsTemplate,
        tabs: this.serializeTabs(),
        totals: this.serializeTotals()
      };
    },

    serializeTabs: function()
    {
      var orders = this.orders;
      var dropZones = this.dropZones;

      return (orders.allMrps || []).map(function(mrp)
      {
        return {
          mrp: mrp,
          label: mrp,
          active: orders.selectedMrp === mrp,
          dropZone: dropZones.getState(mrp)
        };
      });
    },

    serializeTotals: function()
    {
      return this.orders.totalQuantities[this.orders.selectedMrp];
    },

    beforeRender: function()
    {
      document.body.style.overflow = 'hidden';
      document.body.classList.toggle('paintShop-is-fullscreen', this.isFullscreen());
      document.body.classList.toggle('paintShop-is-embedded', IS_EMBEDDED);
    },

    afterRender: function()
    {
      this.$id('todo').on('scroll', this.todoView.onScroll.bind(this.todoView));
      this.$id('queue').on('scroll', this.queueView.onScroll.bind(this.queueView));
      this.$id('done').on('scroll', this.doneView.onScroll.bind(this.doneView));

      $('.modal.fade').removeClass('fade');

      this.resize();
    },

    resize: function()
    {
      this.el.style.height = this.calcHeight() + 'px';
    },

    isFullscreen: function()
    {
      return IS_EMBEDDED
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

    renderTabs: function()
    {
      this.$id('tabs').html(mrpTabsTemplate({
        tabs: this.serializeTabs()
      }));
    },

    renderTotals: function()
    {
      this.$id('totals').html(totalsTemplate({
        totals: this.serializeTotals()
      }));
    },

    updateUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: this.genClientUrl(),
        replace: true,
        trigger: false
      });
    },

    genClientUrl: function()
    {
      var query = [];

      if (this.orders.selectedMrp !== 'all')
      {
        query.push('mrp=' + this.orders.selectedMrp);
      }

      if (this.options.fullscreen)
      {
        query.push('fullscreen=1');
      }

      return this.orders.genClientUrl() + (query.length ? '?' : '') + query.join('&');
    },

    showMrpMenu: function(e)
    {
      var mrp = e.currentTarget.dataset.mrp;
      var menu = [
        t('paintShop', 'menu:header:' + (mrp ? 'mrp' : 'all'), {mrp: mrp}),
        {
          icon: 'fa-clipboard',
          label: t('paintShop', 'menu:copyOrders'),
          handler: this.handleCopyOrdersAction.bind(this, e, mrp)
        },
        {
          icon: 'fa-clipboard',
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.handleCopyChildOrdersAction.bind(this, e, mrp)
        },
        {
          icon: 'fa-print',
          label: t('paintShop', 'menu:printOrders'),
          handler: this.handlePrintOrdersAction.bind(this, 'mrp', mrp)
        },
        {
          icon: 'fa-download',
          label: t('paintShop', 'menu:exportOrders'),
          handler: this.handleExportOrdersAction.bind(this, mrp)
        }
      ];

      if (mrp && user.isAllowedTo('PAINT_SHOP:DROP_ZONES'))
      {
        menu.push({
          icon: 'fa-level-down',
          label: t('paintShop', 'menu:dropZone:' + this.dropZones.getState(mrp)),
          handler: this.handleDropZoneAction.bind(this, mrp)
        });
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    handleCopyOrdersAction: function(e, mrp)
    {
      var view = this;
      var el = e.currentTarget;
      var x = e.pageX;
      var y = e.pageY;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var text = [];
        var usedOrders = {};

        view.orders.forEach(function(order)
        {
          if (mrp && order.get('mrp') !== mrp)
          {
            return;
          }

          var orderNo = order.get('order');

          if (usedOrders[orderNo])
          {
            return;
          }

          text.push(orderNo);

          usedOrders[orderNo] = true;
        });

        clipboardData.setData('text/plain', text.join('\r\n'));

        clipboard.showTooltip(view, el, x, y, {
          title: t('paintShop', 'menu:copyOrders:success')
        });
      });
    },

    handleCopyChildOrdersAction: function(e, mrp)
    {
      var view = this;
      var el = e.currentTarget;
      var x = e.pageX;
      var y = e.pageY;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var text = [];

        view.orders.forEach(function(order)
        {
          if (mrp && order.get('mrp') !== mrp)
          {
            return;
          }

          order.get('childOrders').forEach(function(childOrder)
          {
            text.push(childOrder.order);
          });
        });

        clipboardData.setData('text/plain', text.join('\r\n'));

        clipboard.showTooltip(view, el, x, y, {
          title: t('paintShop', 'menu:copyChildOrders:success')
        });
      });
    },

    handlePrintOrdersAction: function(filterProperty, filterValue)
    {
      var orders = this.orders.filter(function(order)
      {
        return !filterValue || order.get(filterProperty) === filterValue;
      });

      if (!orders.length)
      {
        return;
      }

      html2pdf(printPageTemplate({
        date: +this.orders.getDateFilter('x'),
        mrp: !filterValue ? null : filterProperty === 'order' ? orders[0].get('mrp') : filterValue,
        orderNo: filterProperty === 'order' ? filterValue : null,
        pages: this.serializePrintPages(orders)
      }));
    },

    handleExportOrdersAction: function(mrp)
    {
      window.location.href = '/paintShop/orders;export.xlsx?sort(date,no)&limit(0)'
        + '&date=' + this.orders.getDateFilter()
        + (mrp ? ('&mrp=' + mrp) : '');
    },

    handleDropZoneAction: function(mrp)
    {
      var view = this;
      var $tab = view.$('.paintShop-tab[data-mrp="' + mrp + '"]').addClass('is-loading');
      var $icon = $tab.find('.fa').removeClass('fa-level-down').addClass('fa-spinner fa-spin');
      var req = view.promised(view.dropZones.toggle(mrp));

      req.fail(function()
      {
        $tab.toggleClass('is-dropped', view.dropZones.getState(mrp));

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('paintShop', 'menu:dropZone:failure')
        });
      });

      req.done(function(res)
      {
        $tab.toggleClass('is-dropped', res.state);
      });

      req.always(function()
      {
        $icon.removeClass('fa-spinner fa-spin').addClass('fa-level-down');
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
          text: t('paintShop', 'MSG:search:failure')
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

    onActionRequested: function(action)
    {
      switch (action)
      {
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

      page.broker.publish('router.navigate', {
        url: this.genClientUrl(),
        trigger: false,
        replace: true
      });

      this.renderTabs();
      this.renderTotals();
    },

    onMrpSelected: function()
    {
      this.updateUrl();
      this.renderTotals();

      this.$('.paintShop-tab.is-active').removeClass('is-active');

      if (this.orders.selectedMrp !== 'all')
      {
        this.$('.paintShop-tab[data-mrp="' + this.orders.selectedMrp + '"]').addClass('is-active');
      }
    },

    onDropZoneUpdated: function(dropZone)
    {
      this.$('.paintShop-tab[data-mrp="' + dropZone.get('mrp') + '"]')
        .toggleClass('is-dropped', dropZone.get('state'));
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
      this.orders.setDateFilter(newDate);
      this.dropZones.setDate(this.orders.getDateFilter());

      this.promised(this.orders.fetch({reset: true}));
      this.promised(this.dropZones.fetch({reset: true}));
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
            text: t('paintShop', 'MSG:date:empty')
          });
        }
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('paintShop', 'MSG:date:failure')
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

    startActionTimer: function(action, e)
    {
      this.actionTimer.action = action;
      this.actionTimer.time = Date.now();

      if (e)
      {
        e.preventDefault();
      }
    },

    stopActionTimer: function(action)
    {
      if (this.actionTimer.action !== action)
      {
        return;
      }

      var long = (Date.now() - this.actionTimer.time) > 3000;

      if (action === 'switchApps')
      {
        if (long)
        {
          window.parent.postMessage({type: 'config'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'switch', app: 'mrl'}, '*');
        }
      }
      else if (action === 'reboot')
      {
        if (long)
        {
          window.parent.postMessage({type: 'reboot'}, '*');
        }
        else
        {
          window.parent.postMessage({type: 'refresh'}, '*');
        }
      }
      else if (long && action === 'shutdown')
      {
        window.parent.postMessage({type: 'shutdown'}, '*');
      }

      this.actionTimer.action = null;
      this.actionTimer.time = null;
    }

  });
});
