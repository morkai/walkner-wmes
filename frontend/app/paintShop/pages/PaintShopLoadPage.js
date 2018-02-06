// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../PaintShopSettingCollection',
  '../PaintShopLoadStats',
  '../PaintShopLoadRecent',
  '../PaintShopLoadReport',
  '../views/PaintShopLoadFilterView',
  '../views/PaintShopLoadReportView',
  '../views/PaintShopLoadStatsView',
  '../views/PaintShopLoadRecentView',
  'app/paintShop/templates/load/page',
  'i18n!app/nls/reports'
], function(
  $,
  t,
  View,
  bindLoadingMessage,
  PaintShopSettingCollection,
  PaintShopLoadStats,
  PaintShopLoadRecent,
  PaintShopLoadReport,
  PaintShopLoadFilterView,
  PaintShopLoadReportView,
  PaintShopLoadStatsView,
  PaintShopLoadRecentView,
  template
) {
  'use strict';

  var APP_ID = 'ps-load';
  var IS_EMBEDDED = window.parent !== window || window.location.pathname !== '/';

  return View.extend({

    template: template,

    layoutName: IS_EMBEDDED ? 'blank' : 'page',

    pageId: 'paintShopLoad',

    breadcrumbs: function()
    {
      return [
        {
          href: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          label: t.bound('paintShop', 'BREADCRUMBS:base')
        },
        t.bound('paintShop', 'BREADCRUMBS:load')
      ];
    },

    actions: [
      {
        href: '#paintShop;settings?tab=load',
        icon: 'cogs',
        label: t.bound('paintShop', 'PAGE_ACTIONS:settings'),
        privileges: 'PAINT_SHOP:MANAGE'
      }
    ],

    events: {
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

    localTopics: {
      'socket.connected': function()
      {
        this.promised(this.settings.fetch());
        this.promised(this.stats.fetch());
        this.promised(this.recent.fetch());
      }
    },

    remoteTopics: {
      'paintShop.load.updated': function(message)
      {
        this.stats.set(message.stats);
        this.recent.update(message.items);
      }
    },

    initialize: function()
    {
      this.actionTimer = {
        action: null,
        time: null
      };

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      if (this.report)
      {
        this.setView('#-filter', this.filterView);
        this.setView('#-report', this.reportView);
      }

      this.setView('#-stats', this.statsView);
      this.setView('#-recent', this.recentView);
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);

      $(document.body)
        .css('overflow', '')
        .removeClass('paintShopLoad-page paintShop-is-embedded');
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new PaintShopSettingCollection(null, {pubsub: this.pubsub}), this);
      this.report = IS_EMBEDDED
        ? null
        : bindLoadingMessage(new PaintShopLoadReport(this.options.query), this);
      this.stats = bindLoadingMessage(new PaintShopLoadStats(), this);
      this.recent = bindLoadingMessage(new PaintShopLoadRecent(), this);
    },

    defineViews: function()
    {
      if (this.report)
      {
        this.filterView = new PaintShopLoadFilterView({model: this.report});
        this.reportView = new PaintShopLoadReportView({
          settings: this.settings,
          model: this.report
        });
      }

      this.statsView = new PaintShopLoadStatsView({
        settings: this.settings,
        stats: this.stats
      });
      this.recentView = new PaintShopLoadRecentView({
        settings: this.settings,
        recent: this.recent,
        embedded: IS_EMBEDDED
      });
    },

    defineBindings: function()
    {
      var page = this;

      page.once('afterRender', function()
      {
        if (IS_EMBEDDED)
        {
          window.parent.postMessage({type: 'ready', app: APP_ID}, '*');
        }
      });

      page.listenTo(page.stats, 'change', function()
      {
        clearTimeout(page.timers.reloadStats);
        page.timers.reloadStats = setTimeout(page.stats.fetch.bind(page.stats, {showLoadingMessage: false}), 60000);
      });

      if (page.report)
      {
        page.listenTo(page.report, 'filtered', this.onReportFiltered);
      }

      $(document).on('click', page.onDocumentClick.bind(page));
    },

    load: function(when)
    {
      return when(
        this.settings.fetch(),
        this.stats.fetch(),
        this.recent.fetch(),
        this.report ? this.report.fetch() : null
      );
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        embedded: IS_EMBEDDED
      };
    },

    beforeRender: function()
    {
      if (IS_EMBEDDED)
      {
        document.body.style.overflow = 'hidden';
      }

      document.body.classList.toggle('paintShop-is-embedded', IS_EMBEDDED);
      document.body.classList.add('paintShopLoad-page');
    },

    afterRender: function()
    {
      this.showParentControls();
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
          window.parent.postMessage({type: 'switch', app: APP_ID}, '*');
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
    },

    showParentControls: function()
    {
      var $parentControls = this.$id('parentControls');

      if (!$parentControls.length)
      {
        return;
      }

      $parentControls.fadeIn('fast');

      clearTimeout(this.timers.hideParentControls);

      this.timers.hideParentControls = setTimeout(function() { $parentControls.fadeOut('fast'); }, 15000);
    },

    onDocumentClick: function()
    {
      this.showParentControls();
    },

    onReportFiltered: function()
    {
      this.broker.publish('router.navigate', {
        url: this.report.genClientUrl(),
        trigger: false,
        replace: true
      });

      this.promised(this.report.fetch());
    }

  });
});
