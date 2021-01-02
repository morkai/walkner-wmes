// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
  'app/data/localStorage',
  'app/planning/util/contextMenu',
  'app/paintShop/PaintShopSettingCollection',
  'app/paintShop/PaintShopLoadStats',
  'app/paintShop/PaintShopLoadRecent',
  'app/paintShop/views/load/StatsView',
  'app/paintShop/views/load/RecentView',
  'app/paintShop/views/load/ReasonEditorView',
  'app/paintShop/templates/load/monitoring',
  'i18n!app/nls/reports'
], function(
  $,
  t,
  viewport,
  View,
  bindLoadingMessage,
  embedded,
  localStorage,
  contextMenu,
  PaintShopSettingCollection,
  PaintShopLoadStats,
  PaintShopLoadRecent,
  StatsView,
  RecentView,
  ReasonEditorView,
  template
) {
  'use strict';

  var APP_ID = 'ps-load';

  return View.extend({

    template: template,

    layoutName: embedded.isEnabled() ? 'blank' : 'page',

    pageClassName: 'psLoad-monitoring',

    nlsDomain: 'paintShop',

    breadcrumbs: function()
    {
      var page = this;

      return [
        {
          href: '#paintShop/' + (window.WMES_LAST_PAINT_SHOP_DATE || '0d'),
          label: page.t('BREADCRUMB:base')
        },
        this.t('BREADCRUMB:load'),
        {
          href: '#paintShop/load/monitoring?counter=' + page.counter,
          label: page.t('load:counters:' + page.counter),
          template: function(breadcrumb)
          {
            return '<a id="' + page.idPrefix + '-pickCounter" href="' + breadcrumb.href + '">'
              + breadcrumb.label
              + '</a>';
          }
        }
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
          icon: 'warning',
          label: this.t('load:reasons:pageAction'),
          callback: this.showReasonEditor.bind(this),
          privileges: ['PAINT_SHOP:MANAGE', 'PAINT_SHOP:PAINTER']
        },
        {
          href: '#paintShop/load/history',
          icon: 'list',
          label: this.t('load:history:pageAction')
        },
        {
          href: '#paintShop/load/report',
          icon: 'line-chart',
          label: this.t('load:report:pageAction')
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
        if (message.counter === this.counter)
        {
          this.stats.set(message.stats);
          this.recent.update(message.items);
        }
      }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-stats', this.statsView);
      this.setView('#-recent', this.recentView);
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.counter = this.options.counter > 0
        ? this.options.counter
        : (embedded.isEnabled() ? +localStorage.getItem('WMES_PS_LOAD_COUNTER') : 0) || 1;
      this.settings = bindLoadingMessage(new PaintShopSettingCollection(null, {pubsub: this.pubsub}), this);
      this.stats = bindLoadingMessage(new PaintShopLoadStats({counter: this.counter}), this);
      this.recent = bindLoadingMessage(new PaintShopLoadRecent({counter: this.counter}), this);
    },

    defineViews: function()
    {
      this.statsView = new StatsView({
        settings: this.settings,
        stats: this.stats
      });
      this.recentView = new RecentView({
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

        $(document)
          .on('click.' + page.idPrefix, page.onDocumentClick.bind(page))
          .on('click.' + page.idPrefix, '#' + page.idPrefix + '-pickCounter', page.onBreadcrumbsClick.bind(page));
      });

      page.listenTo(page.stats, 'change', function()
      {
        clearTimeout(page.timers.reloadStats);
        page.timers.reloadStats = setTimeout(page.stats.fetch.bind(page.stats, {showLoadingMessage: false}), 60000);
      });
    },

    load: function(when)
    {
      return when(
        this.settings.fetch(),
        this.stats.fetch(),
        this.recent.fetch()
      );
    },

    getTemplateData: function()
    {
      return {
        counterLabel: embedded.isEnabled() ? this.t('load:counters:' + this.counter) : null
      };
    },

    afterRender: function()
    {
      embedded.render(this, {
        actions: {
          showReasonEditor: {
            icon: 'fa-warning',
            title: this.t('load:reasons:action'),
            handler: this.showReasonEditor.bind(this),
            separator: true
          }
        }
      });

      this.showEmbeddedActions();
    },

    showReasonEditor: function()
    {
      var dialogView = new ReasonEditorView({
        settings: this.settings,
        model: {
          counter: this.counter
        }
      });

      viewport.showDialog(dialogView, this.t('load:reasons:title'));
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

    showCounterPicker: function(top, left)
    {
      var page = this;

      var menu = [1, 2, 3].map(function(id)
      {
        return {
          label: page.t('load:counters:' + id),
          handler: page.setCounter.bind(page, id),
          disabled: id === page.counter
        };
      });

      contextMenu.show(page, top, left, menu);
    },

    setCounter: function(newCounter)
    {
      this.counter = newCounter;

      if (this.layout && this.layout.setBreadcrumbs)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
      }

      this.stats.set('counter', this.counter);
      this.recent.set('counter', this.counter);

      this.promised(this.stats.fetch());
      this.promised(this.recent.fetch());

      if (embedded.isEnabled())
      {
        localStorage.setItem('WMES_PS_LOAD_COUNTER', this.counter.toString());

        this.$id('pickCounter').text(this.t('load:counters:' + this.counter));
      }
      else
      {
        this.broker.publish('router.navigate', {
          url: '/paintShop/load/monitoring?counter=' + this.counter,
          replace: true,
          trigger: false
        });
      }
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    onDocumentClick: function()
    {
      this.showEmbeddedActions();
    },

    onBreadcrumbsClick: function(e)
    {
      this.showCounterPicker(e.pageY, e.pageX);

      return false;
    }

  });
});
