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
      'shiftChanged': function(newShift)
      {
        if (newShift.no === 1 && this.orders.isDateCurrent())
        {
          this.orders.fetch({reset: true});
        }
      },
      'paintShop.orders.imported': function(message)
      {
        var currentDate = this.orders.getDateFilter();
        var importedDate = time.format(message.date, 'YYYY-MM-DD');

        if (importedDate === currentDate)
        {
          this.orders.fetch({reset: true});
        }
      },
      'paintShop.orders.updated.**': function(changes)
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
      var handleDragEvent = page.handleDragEvent.bind(page);

      page.listenTo(page.orders, 'reset', this.onOrdersReset);

      $(document)
        .on('dragstart.' + idPrefix, handleDragEvent)
        .on('dragenter.' + idPrefix, handleDragEvent)
        .on('dragleave.' + idPrefix, handleDragEvent)
        .on('dragover.' + idPrefix, handleDragEvent)
        .on('drop.' + idPrefix, page.onDrop.bind(page))
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

    applyPendingChanges: function()
    {
      if (this.pendingChanges)
      {
        this.pendingChanges.forEach(this.applyChanges, this);
        this.pendingChanges = null;
      }
    },

    applyChanges: function(change)
    {
      if (change instanceof PaintShopOrder)
      {
        var newRequest = change;
        var oldRequest = this.orders.get(newRequest.id);

        if (!oldRequest)
        {
          this.requests.add(newRequest);
        }
        else if (newRequest.get('updatedAt') > oldRequest.get('updatedAt'))
        {
          oldRequest.set(newRequest.attributes);
        }
      }
      else
      {
        var request = this.requests.get(change._id);

        if (!request)
        {
          return this.scheduleOrdersReload();
        }

        if (change.updatedAt > request.get('updatedAt'))
        {
          request.set(change);
        }
      }
    },

    scheduleOrdersReload: function()
    {
      clearTimeout(this.timers.reloadOrders);

      this.timers.reloadOrders = setTimeout(
        function(page) { page.promised(page.orders.fetch({reset: true})); },
        1,
        this
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

      this.broker.publish('router.navigate', {
        url: this.genClientUrl(),
        replace: true,
        trigger: false
      });

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

    handleDragEvent: function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      e = e.originalEvent;

      e.preventDefault();
      e.stopPropagation();

      if (!e.dataTransfer.files.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('paintShop', 'msg:filesOnly')
        });
      }

      var file = _.find(e.dataTransfer.files, function(file)
      {
        return /vnd.ms-excel.sheet|spreadsheetml.sheet/.test(file.type) && /\.xls[xm]$/.test(file.name);
      });

      if (!file)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('paintShop', 'msg:invalidFile')
        });
      }

      viewport.msg.loading();

      var formData = new FormData();

      formData.append('queue', file);

      var page = this;
      var req = page.ajax({
        type: 'POST',
        url: '/paintShop/orders;import',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });

      req.done(function(res)
      {
        viewport.msg.loaded();

        page.orders.setDateFilter(time.utc.format(res.date, 'YYYY-MM-DD'));
        page.promised(page.orders.fetch({reset: true}));
      });
    },

    genClientUrl: function()
    {
      return this.orders.genClientUrl() + (this.options.fullscreen ? '?fullscreen=1' : '');
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

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      if (IS_EMBEDDED)
      {
        this.showDatePickerDialog();

        return false;
      }

      var liEl = e.target.parentNode;

      liEl.innerHTML = '';

      var page = this;
      var currentDate = page.orders.getDateFilter('YYYY-MM-DD');

      var $date = $('<input type="date" class="form-control paintShop-dateBreadcrumb">')
        .val(currentDate)
        .appendTo(liEl)
        .focus()
        .on('keyup', function(e)
        {
          if (e.keyCode === 13)
          {
            saveAndHide($date.val());

            return false;
          }

          if (e.keyCode === 27)
          {
            saveAndHide(null);

            return false;
          }
        })
        .on('blur', function() { saveAndHide($date.val()); });

      return false;

      function saveAndHide(newDate)
      {
        if (newDate === '')
        {
          newDate = getShiftStartInfo(Date.now()).moment.format('YYYY-MM-DD');
        }

        var newDateMoment = time.getMoment(newDate, 'YYYY-MM-DD');

        $date.remove();

        if (!newDateMoment.isValid() || newDate === currentDate)
        {
          newDate = currentDate;
        }
        else
        {
          page.orders.setDateFilter(newDate);
          page.orders.fetch({reset: true});
        }

        liEl.innerHTML = '<a href="#paintShop/' + newDate + '">'
          + time.getMoment(newDate, 'YYYY-MM-DD').format('L')
          + '</a>';
      }
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
