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
  '../DrillingOrder',
  '../DrillingOrderCollection',
  '../DrillingSettingCollection',
  '../views/QueueView',
  '../views/ListView',
  '../views/DatePickerView',
  '../views/UserPickerView',
  'app/wmes-drilling/templates/page',
  'app/wmes-drilling/templates/mrpTabs',
  'app/wmes-drilling/templates/totals',
  'app/wmes-drilling/templates/printPage',
  'app/wmes-drilling/templates/userPageAction'
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
  DrillingOrder,
  DrillingOrderCollection,
  DrillingSettingCollection,
  QueueView,
  ListView,
  DatePickerView,
  UserPickerView,
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
    painted: 4
  };

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    pageId: 'drilling',

    modelProperty: 'orders',

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMBS:base'),
        {
          href: '#drilling/' + this.orders.getDateFilter(),
          label: this.orders.getDateFilter('L'),
          template: function(breadcrumb)
          {
            return '<span class="drilling-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a>'
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

      if (embedded.isEnabled())
      {
        actions.push({
          id: 'user',
          template: function()
          {
            return userPageActionTemplate({
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
        }, {
          label: page.t('PAGE_ACTIONS:paintShop'),
          icon: 'paint-brush',
          privileges: 'PAINT_SHOP:VIEW',
          href: '#paintShop/' + page.orders.getDateFilter()
        }, {
          href: '#drilling;settings?tab=planning',
          icon: 'cogs',
          label: page.t('PAGE_ACTIONS:settings'),
          privileges: 'DRILLING:MANAGE'
        });
      }

      return actions;
    },

    localTopics: {
      'socket.connected': function()
      {
        this.$el.removeClass('drilling-is-disconnected');
      },
      'socket.disconnected': function()
      {
        this.$el.addClass('drilling-is-disconnected');
      }
    },

    remoteTopics: {
      'drilling.orders.changed.*': function(message)
      {
        var currentDate = this.orders.getDateFilter();
        var importedDate = time.utc.format(message.date, 'YYYY-MM-DD');

        if (importedDate === currentDate)
        {
          this.orders.applyChanges(message.changes);
        }
      },
      'drilling.orders.updated.*': function(changes)
      {
        var order = this.orders.get(changes._id);

        if (order)
        {
          order.set(DrillingOrder.parse(changes));

          if (changes.qtyDrill != null
            || changes.status != null)
          {
            this.orders.recountTotals();
          }
        }
      }
    },

    events: {
      'mousedown .drilling-tab': function(e)
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
      'click .drilling-tab[data-mrp]': function(e)
      {
        if (this.timers.showMrpMenu)
        {
          clearTimeout(this.timers.showMrpMenu);
          this.timers.showMrpMenu = null;

          this.orders.selectMrp(e.currentTarget.dataset.mrp);
        }
      },
      'contextmenu .drilling-tab': function(e)
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

      this.defineModels();
      this.defineViews();
      this.defineBindings();

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
        .removeClass('drilling-is-fullscreen drilling-is-embedded');

      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);

      if (this.orderDetailsWindow)
      {
        this.orderDetailsWindow.close();
        this.orderDetailsWindow = null;
      }
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new DrillingSettingCollection(null, {pubsub: this.pubsub}), this);

      this.orders = bindLoadingMessage(DrillingOrderCollection.forDate(this.options.date, {
        selectedMrp: this.options.selectedMrp || 'all',
        settings: this.settings,
        user: JSON.parse(sessionStorage.getItem('WMES_DRILL_USER') || 'null')
      }), this);
    },

    defineViews: function()
    {
      this.vkbView = embedded.isEnabled() ? new VkbView() : null;
      this.todoView = new ListView({
        model: this.orders,
        showTimes: false,
        showSearch: true,
        showTotals: false,
        vkb: this.vkbView,
        filter: function(order)
        {
          return order.status === 'new' || order.status === 'cancelled';
        }
      });
      this.doneView = new ListView({
        model: this.orders,
        showTimes: true,
        showSearch: false,
        showTotals: true,
        filter: function(order)
        {
          return STATUS_WEIGHTS[order.status] >= 1;
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
      this.queueView = new QueueView({
        orders: this.orders,
        vkb: this.vkbView,
        embedded: embedded.isEnabled()
      });
    },

    defineBindings: function()
    {
      var page = this;
      var idPrefix = page.idPrefix;

      page.listenTo(page.orders, 'reset', _.after(2, page.onOrdersReset));
      page.listenTo(page.orders, 'mrpSelected', page.onMrpSelected);
      page.listenTo(page.orders, 'totalsRecounted', page.renderTotals);

      page.listenTo(page.queueView, 'actionRequested', page.onActionRequested);

      $(document)
        .on('click.' + idPrefix, '.drilling-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window)
        .on('resize.' + idPrefix, page.onResize);

      page.once('afterRender', function()
      {
        embedded.ready();
        page.onOrdersReset();
      });
    },

    load: function(when)
    {
      return when(
        this.settings.fetch({reset: true}),
        this.orders.fetch({reset: true})
      );
    },

    getTemplateData: function()
    {
      return {
        embedded: embedded.isEnabled(),
        height: this.calcInitialHeight() + 'px',
        renderTabs: mrpTabsTemplate,
        renderTotals: totalsTemplate,
        tabs: this.serializeTabs(),
        totals: this.serializeTotals()
      };
    },

    serializeTabs: function()
    {
      var page = this;
      var orders = page.orders;

      return ['all'].concat(orders.allMrps || []).map(function(mrp)
      {
        return {
          mrp: mrp,
          label: mrp,
          description: t.has('wmes-drilling', 'mrp:' + mrp) ? page.t('mrp:' + mrp) : '',
          active: orders.selectedMrp === mrp
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
      document.body.classList.toggle('drilling-is-fullscreen', this.isFullscreen());
      document.body.classList.toggle('drilling-is-embedded', embedded.isEnabled());
    },

    afterRender: function()
    {
      this.$id('todo').on('scroll', this.todoView.onScroll.bind(this.todoView));
      this.$id('queue').on('scroll', this.queueView.onScroll.bind(this.queueView));
      this.$id('done').on('scroll', this.doneView.onScroll.bind(this.doneView));

      $('.modal.fade').removeClass('fade');

      embedded.render(this);
      this.resize();
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

      document.body.classList.toggle('drilling-is-fullscreen', fullscreen);

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

      var isEmbedded = embedded.isEnabled();
      var mrp = e.currentTarget.dataset.mrp || null;
      var actionOptions = {
        filterProperty: !mrp ? null : 'mrp',
        filterValue: mrp
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
          page.orderDetailsWindow.close();
          page.orderDetailsWindow = null;
        }, 30000);
      };

      win.focus();
    },

    handleCopyOrdersAction: function(e, options)
    {
      var page = this;
      var el = e.currentTarget;
      var x = e.pageX;
      var y = e.pageY;
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
          }

          if (usedOrders[orderNo])
          {
            return;
          }

          text.push(orderNo);

          usedOrders[orderNo] = true;
        });

        clipboardData.setData('text/plain', text.join('\r\n'));

        clipboard.showTooltip(page, el, x, y, {
          title: page.t('menu:copyOrders:success')
        });
      });
    },

    handleCopyChildOrdersAction: function(e, options)
    {
      var page = this;
      var el = e.currentTarget;
      var x = e.pageX;
      var y = e.pageY;
      var filterProperty = options.filterProperty;
      var filterValue = options.filterValue;

      clipboard.copy(function(clipboardData)
      {
        if (!clipboardData)
        {
          return;
        }

        var text = [];

        page.orders.serialize().forEach(function(order)
        {
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
          }

          order.childOrders.forEach(function(childOrder)
          {
            text.push(childOrder.order);
          });
        });

        clipboardData.setData('text/plain', text.join('\r\n'));

        clipboard.showTooltip(page, el, x, y, {
          title: page.t('menu:copyChildOrders:success')
        });
      });
    },

    handlePrintOrdersAction: function(options, e)
    {
      var page = this;
      var filterProperty = options.filterProperty;
      var filterValue = options.filterValue;

      e.contextMenu.tag = 'paintShop';

      PrinterPickerView.contextMenu(e, function(printer)
      {
        var orders = page.orders.filter(function(order)
        {
          if (order.get('status') === 'cancelled')
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
      var url = '/drilling/orders;export.xlsx?sort(date,no)&limit(0)&date=' + this.orders.getDateFilter();

      if (options.filterProperty === 'mrp')
      {
        url += '&mrp=' + options.filterValue;
      }

      pageActions.exportXlsx(url);
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
            if (DrillingOrder.isComponentBlacklisted(component))
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
        url: '/drilling/orders?select(date,mrp)&limit(1)'
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

      this.$('.drilling-tab.is-active').removeClass('is-active');
      this.$('.drilling-tab[data-mrp="' + this.orders.selectedMrp + '"]').addClass('is-active');
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

      this.promised(this.orders.fetch({reset: true}));
    },

    showDatePickerDialog: function()
    {
      var dialogView = new DatePickerView({
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
      $('.drilling-breadcrumb').find('a').addClass('disabled');

      var page = this;
      var date = +page.orders.getDateFilter('x');
      var month = 30 * 24 * 3600 * 1000;
      var url = '/drilling/orders?limit(1)&select(date)';

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
          sessionStorage.setItem('WMES_DRILL_USER', JSON.stringify(user));
        }
        else
        {
          sessionStorage.removeItem('WMES_DRILL_USER');
        }

        page.orders.user = user;

        if (page.layout)
        {
          page.layout.setActions(page.actions, page);
        }

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView);
    }

  });
});
