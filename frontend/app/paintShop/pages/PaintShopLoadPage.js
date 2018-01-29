// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../PaintShopLoadStats',
  '../views/PaintShopLoadStatsView',
  'app/paintShop/templates/load/page'
], function(
  $,
  t,
  View,
  bindLoadingMessage,
  PaintShopLoadStats,
  PaintShopLoadStatsView,
  pageTemplate
) {
  'use strict';

  var APP_ID = 'ps-load';
  var IS_EMBEDDED = window.parent !== window || window.location.pathname !== '/';

  return View.extend({

    template: pageTemplate,

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

    initialize: function()
    {
      this.actionTimer = {
        action: null,
        time: null
      };

      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-stats', this.statsView);
    },

    destroy: function()
    {
      $(document.body)
        .css('overflow', '')
        .removeClass('paintShop-is-embedded');
    },

    defineModels: function()
    {
      this.stats = bindLoadingMessage(new PaintShopLoadStats(), this, 'MSG:LOADING_FAILED:stats');
    },

    defineViews: function()
    {
      this.statsView = new PaintShopLoadStatsView({
        model: this.stats
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
    },

    load: function(when)
    {
      return when(this.stats.fetch());
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
    }

  });
});
