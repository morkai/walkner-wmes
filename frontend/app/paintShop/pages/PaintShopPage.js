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
  'app/data/clipboard',
  'app/production/views/VkbView',
  'app/planning/util/contextMenu',
  '../PaintShopOrder',
  '../PaintShopOrderCollection',
  '../PaintShopDropZoneCollection',
  '../views/PaintShopQueueView',
  '../views/PaintShopListView',
  '../views/PaintShopDatePickerView',
  'app/paintShop/templates/page',
  'app/paintShop/templates/mrpTabs',
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
  clipboard,
  VkbView,
  contextMenu,
  PaintShopOrder,
  PaintShopOrderCollection,
  PaintShopDropZoneCollection,
  PaintShopQueueView,
  PaintShopListView,
  PaintShopDatePickerView,
  pageTemplate,
  mrpTabsTemplate,
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
        t.bound('paintShop', 'BREADCRUMBS:queue'),
        {
          href: '#paintShop/' + this.orders.getDateFilter(),
          label: this.orders.getDateFilter('L')
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
        }
      },
      'paintShop.dropZones.updated.*': function(message)
      {
        this.dropZones.updated(message);
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

      this.actionTimer = {
        action: null,
        time: null
      };

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-queue', this.queueView);
      this.setView('#-list-all', this.allListView);
      this.setView('#-list-work', this.workListView);

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
      this.orders = bindLoadingMessage(PaintShopOrderCollection.forDate(this.options.date), this);
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
      this.allListView = new PaintShopListView({
        model: this.orders,
        showTimes: false,
        showSearch: true,
        vkb: this.vkbView,
        filter: function(psOrder)
        {
          return psOrder.status === 'new' || psOrder.status === 'cancelled';
        }
      });
      this.workListView = new PaintShopListView({
        model: this.orders,
        showTimes: true,
        showSearch: false,
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

      page.listenTo(page.orders, 'reset', this.onOrdersReset);
      page.listenTo(page.orders, 'mrpSelected', this.onMrpSelected);

      page.listenTo(page.dropZones, 'reset', this.renderTabs);
      page.listenTo(page.dropZones, 'updated', this.onDropZoneUpdated);

      page.listenTo(page.queueView, 'actionRequested', this.onActionRequested);

      $(document)
        .on('click.' + idPrefix, '.page-breadcrumbs', this.onBreadcrumbsClick.bind(this));

      $(window)
        .on('resize.' + idPrefix, this.onResize);

      if (IS_EMBEDDED)
      {
        page.once('afterRender', function() { window.parent.postMessage({type: 'ready', app: 'paintShop'}, '*'); });
      }
    },

    load: function(when)
    {
      return when(
        this.orders.fetch({reset: true}),
        this.dropZones.fetch({reset: true})
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        embedded: IS_EMBEDDED,
        height: this.calcInitialHeight() + 'px',
        renderTabs: mrpTabsTemplate,
        tabs: this.serializeTabs()
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

    beforeRender: function()
    {
      document.body.style.overflow = 'hidden';
      document.body.classList.toggle('paintShop-is-fullscreen', this.isFullscreen());
      document.body.classList.toggle('paintShop-is-embedded', IS_EMBEDDED);
    },

    afterRender: function()
    {
      $('.modal.fade').removeClass('fade');

      if (this.options.selectedMrp)
      {
        this.$('.paintShop-tab[data-mrp="' + this.options.selectedMrp + '"]').click();

        this.options.selectedMrp = null;
      }

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

      return this.orders.genClientUrl() + '?' + query.join('&');
    },

    showMrpMenu: function(e)
    {
      var mrp = e.currentTarget.dataset.mrp;
      var menu = [
        t('paintShop', 'menu:header:' + (mrp ? 'mrp' : 'all'), {mrp: mrp}),
        {
          label: t('paintShop', 'menu:copyOrders'),
          handler: this.handleCopyOrdersAction.bind(this, e, mrp)
        },
        {
          label: t('paintShop', 'menu:copyChildOrders'),
          handler: this.handleCopyChildOrdersAction.bind(this, e, mrp)
        },
        {
          label: t('paintShop', 'menu:printOrders'),
          handler: this.handlePrintOrdersAction.bind(this, 'mrp', mrp)
        }
      ];

      if (mrp && user.isAllowedTo('PAINT_SHOP:DROP_ZONES'))
      {
        menu.push({
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

      var win = window.open(null, 'PAINT_SHOP:PLAN_PRINT');

      if (!win)
      {
        return viewport.msg.show({
          type: 'error',
          time: 5000,
          text: t('core', 'MSG:POPUP_BLOCKED')
        });
      }

      win.document.body.innerHTML = printPageTemplate({
        date: +this.orders.getDateFilter('x'),
        mrp: !filterValue ? null : filterProperty === 'order' ? orders[0].get('mrp') : filterValue,
        orderNo: filterProperty === 'order' ? filterValue : null,
        pages: this.serializePrintPages(orders),
        pad: function(v)
        {
          if (v < 10)
          {
            return '&nbsp;' + v;
          }

          return v;
        }
      });
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
            push({
              type: 'component',
              no: '',
              order: '',
              nc12: component.nc12,
              qty: component.qty,
              unit: component.unit,
              name: childOrder.name,
              mrp: ''
            });
          });
        });
      });

      return pages;
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
    },

    onMrpSelected: function()
    {
      this.updateUrl();

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

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      this.showDatePickerDialog();

      return false;
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
          this.orders.setDateFilter(newDate);
          this.dropZones.setDate(this.orders.getDateFilter());

          this.promised(this.orders.fetch({reset: true}));
          this.promised(this.dropZones.fetch({reset: true}));
        }
      });

      viewport.showDialog(dialogView);
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
