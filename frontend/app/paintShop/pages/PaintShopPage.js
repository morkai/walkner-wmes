// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/getShiftStartInfo',
  'app/production/views/VkbView',
  '../PaintShopOrder',
  '../views/PaintShopQueueView',
  '../views/PaintShopListView',
  '../views/PaintShopDatePickerView',
  'app/paintShop/templates/page'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  bindLoadingMessage,
  getShiftStartInfo,
  VkbView,
  PaintShopOrder,
  PaintShopQueueView,
  PaintShopListView,
  PaintShopDatePickerView,
  template
) {
  'use strict';

  var IS_EMBEDDED = window.parent !== window;

  return View.extend({

    template: template,

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
      }
    },

    events: {
      'click .paintShop-tab[data-mrp]': function(e)
      {
        this.$('.paintShop-tab.is-active').removeClass('is-active');

        this.orders.selectMrp(e.currentTarget.dataset.mrp);

        if (this.orders.selectedMrp !== 'all')
        {
          this.$(e.currentTarget).addClass('is-active');
        }
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
      $('.modal').addClass('fade');

      $(document.body)
        .css('overflow', '')
        .removeClass('paintShop-is-fullscreen paintShop-is-embedded');

      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.orders = bindLoadingMessage(this.model.orders, this);
    },

    defineViews: function()
    {
      this.vkbView = IS_EMBEDDED ? new VkbView() : null;
      this.queueView = new PaintShopQueueView({
        model: this.orders,
        vkb: this.vkbView
      });
      this.allListView = new PaintShopListView({
        model: this.orders,
        showTimes: false,
        filter: null
      });
      this.workListView = new PaintShopListView({
        model: this.orders,
        showTimes: true,
        filter: function(psOrder)
        {
          return psOrder.status === 'started' || psOrder.status === 'finished';
        },
        sort: function(a, b)
        {
          if (a.status === 'started')
          {
            if (a.status === b.status)
            {
              return a.startedAt - b.startedAt;
            }

            return -1;
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
        this.orders.fetch({reset: true})
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        embedded: IS_EMBEDDED,
        height: this.calcInitialHeight() + 'px',
        tabs: this.serializeTabs()
      };
    },

    serializeTabs: function()
    {
      var orders = this.orders;

      return orders.allMrps.map(function(mrp)
      {
        return {
          mrp: mrp,
          label: mrp,
          active: orders.selectedMrp === mrp
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
      var html = '';

      this.serializeTabs().forEach(function(tab)
      {
        html += '<div class="paintShop-tab ' + (tab.active ? 'is-active' : '') + '" data-mrp="' + tab.mrp + '">'
          + tab.label
          + '</div>';
      });

      html += '<div class="paintShop-tab"></div>';

      this.$id('tabs').html(html);
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
          this.orders.fetch({reset: true});
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
