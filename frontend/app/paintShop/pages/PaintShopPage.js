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
  '../PaintShopOrder',
  '../views/PaintShopQueueView',
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
  PaintShopOrder,
  PaintShopQueueView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    pageId: 'paintShop',

    breadcrumbs: function()
    {
      return [
        t.bound('paintShop', 'BREADCRUMBS:base'),
        t.bound('paintShop', 'BREADCRUMBS:queue'),
        this.orders.getDateFilter('L')
      ];
    },

    actions: function()
    {
      return [
        {
          type: 'link',
          icon: 'arrows-alt',
          callback: this.toggleFullscreen.bind(this)
        }
      ];
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
      'paintShopOrders.updated.**': function(change)
      {
        console.log(arguments);
      }
    },

    events: {

    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 30);

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#' + this.idPrefix + '-queue', this.queueView);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      document.body.style.overflow = '';
      document.body.classList.remove('paintShop-is-fullscreen');

      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.orders = bindLoadingMessage(this.model.orders, this);
    },

    defineViews: function()
    {
      this.queueView = new PaintShopQueueView({
        model: this.orders
      });
    },

    defineBindings: function()
    {
      var page = this;
      var idPrefix = page.idPrefix;

      page.listenTo(page.orders, 'sync', this.onOrdersSync);

      var handleDragEvent = page.handleDragEvent.bind(page);

      $(document)
        .on('dragstart.' + idPrefix, handleDragEvent)
        .on('dragenter.' + idPrefix, handleDragEvent)
        .on('dragleave.' + idPrefix, handleDragEvent)
        .on('dragover.' + idPrefix, handleDragEvent)
        .on('drop.' + idPrefix, page.onDrop.bind(page));

      $(window)
        .on('resize.' + this.idPrefix, this.onResize);
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
        height: this.calcInitialHeight() + 'px'
      };
    },

    beforeRender: function()
    {
      document.body.style.overflow = 'hidden';
      document.body.classList.toggle('paintShop-is-fullscreen', this.isFullscreen());
    },

    afterRender: function()
    {
      this.resize();

      var $groups = this.$('.paintShop-groups');

      if ($groups.length)
      {
        $groups[0].style.display = '';
      }
    },

    resize: function()
    {
      this.el.style.height = this.calcHeight() + 'px';
    },

    isFullscreen: function()
    {
      return this.options.fullscreen
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

    acceptRequest: function(request, responder)
    {
      var page = this;

      this.requests.accept(request.id, {id: responder.id, label: responder.getLabel()}, function(err)
      {
        if (err)
        {
          page.showMessage('error', 5000, acceptFailureMessage({
            error: err.message
          }));
        }
        else
        {
          page.showMessage('info', 10000, acceptSuccessMessage({
            whman: responder.getLabel(),
            requestType: request.get('type'),
            orgUnit: request.get('orgUnit'),
            palletKind: request.getFullPalletKind()
          }));
        }
      });
    },

    finishResponse: function(request)
    {
      var page = this;
      var requestType = request.get('type');

      this.requests.finish(request.id, function(err)
      {
        if (err)
        {
          page.showMessage('error', 5000, finishFailureMessage({
            error: err.message
          }));
        }
        else
        {
          page.showMessage('success', 2500, finishSuccessMessage({
            type: requestType,
            line: request.getProdLineId()
          }));
        }
      });
    },

    showMessage: function(type, time, message)
    {
      if (this.timers.hideMessage)
      {
        clearTimeout(this.timers.hideMessage);
      }

      var $overlay = this.$id('messageOverlay');
      var $message = this.$id('message');

      $overlay.css('display', 'block');
      $message
        .html(message).css({
          display: 'block',
          marginLeft: '-5000px'
        })
        .removeClass('message-error message-warning message-success message-info')
        .addClass('message-' + type);

      $message.css({
        display: 'none',
        marginTop: ($message.outerHeight() / 2 * -1) + 'px',
        marginLeft: ($message.outerWidth() / 2 * -1) + 'px'
      });

      $message.fadeIn();

      this.timers.hideMessage = setTimeout(this.hideMessage.bind(this), time);
    },

    hideMessage: function()
    {
      if (!this.timers.hideMessage)
      {
        return;
      }

      clearTimeout(this.timers.hideMessage);

      var page = this;
      var $overlay = page.$id('messageOverlay');
      var $message = page.$id('message');

      $message.fadeOut(function()
      {
        $overlay.css('display', 'none');
        $message.css('display', 'none');

        page.timers.hideMessage = null;
      });
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

    onOrdersSync: function()
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
    }

  });
});
