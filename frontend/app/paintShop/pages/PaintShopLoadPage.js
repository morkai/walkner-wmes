// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
  '../PaintShopSettingCollection',
  '../PaintShopLoadStats',
  '../PaintShopLoadRecent',
  '../PaintShopLoadReport',
  '../views/PaintShopLoadFilterView',
  '../views/PaintShopLoadReportView',
  '../views/PaintShopLoadStatsView',
  '../views/PaintShopLoadRecentView',
  '../views/ExportLoadDialogView',
  'app/paintShop/templates/load/page',
  'i18n!app/nls/reports'
], function(
  $,
  t,
  viewport,
  View,
  bindLoadingMessage,
  embedded,
  PaintShopSettingCollection,
  PaintShopLoadStats,
  PaintShopLoadRecent,
  PaintShopLoadReport,
  PaintShopLoadFilterView,
  PaintShopLoadReportView,
  PaintShopLoadStatsView,
  PaintShopLoadRecentView,
  ExportLoadDialogView,
  template
) {
  'use strict';

  var APP_ID = 'ps-load';

  return View.extend({

    template: template,

    layoutName: embedded.isEnabled() ? 'blank' : 'page',

    pageId: 'paintShopLoad',

    modelProperty: 'report',

    breadcrumbs: function()
    {
      return [
        {
          href: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          label: this.t('BREADCRUMB:base')
        },
        this.t('BREADCRUMB:load')
      ];
    },

    actions: function()
    {
      if (embedded.isEnabled())
      {
        return [];
      }

      return [
        {
          icon: 'download',
          label: this.t('exportLoad:pageAction'),
          callback: this.showExportLoadDialog.bind(this)
        },
        {
          href: '#paintShop;settings?tab=load',
          icon: 'cogs',
          label: this.t('PAGE_ACTION:settings'),
          privileges: 'PAINT_SHOP:MANAGE'
        }
      ];
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
      this.report = embedded.isEnabled()
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
        embedded: embedded.isEnabled()
      });
    },

    defineBindings: function()
    {
      var page = this;

      page.once('afterRender', function()
      {
        if (embedded.isEnabled())
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

    getTemplateData: function()
    {
      return {
        embedded: embedded.isEnabled()
      };
    },

    beforeRender: function()
    {
      if (embedded.isEnabled())
      {
        document.body.style.overflow = 'hidden';
      }

      document.body.classList.toggle('paintShop-is-embedded', embedded.isEnabled());
      document.body.classList.add('paintShopLoad-page');
    },

    afterRender: function()
    {
      embedded.render(this);
      this.showEmbeddedActions();
    },

    showEmbeddedActions: function()
    {
      var $embeddedActions = this.$('.embedded-actions');

      if (!$embeddedActions.length)
      {
        return;
      }

      $embeddedActions.fadeIn('fast');

      clearTimeout(this.timers.hideEmbeddedActions);

      this.timers.hideEmbeddedActions = setTimeout(function() { $embeddedActions.fadeOut('fast'); }, 15000);
    },

    showExportLoadDialog: function()
    {
      var dialogView = new ExportLoadDialogView({
        model: this.report
      });

      viewport.showDialog(dialogView, this.t('exportLoad:title'));
    },

    onDocumentClick: function()
    {
      this.showEmbeddedActions();
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
