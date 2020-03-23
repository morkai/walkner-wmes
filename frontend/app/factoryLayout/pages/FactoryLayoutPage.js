// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'screenfull',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/data/localStorage',
  '../views/FactoryLayoutCanvasView'
], function(
  $,
  screenfull,
  t,
  View,
  bindLoadingMessage,
  localStorage,
  FactoryLayoutCanvasView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    localTopics: {
      'socket.connected': function()
      {
        this.model.load(true);
      }
    },

    breadcrumbs: function()
    {
      return [
        this.t('bc:layout')
      ];
    },

    actions: function()
    {
      var page = this;
      var actions = [];

      if (document.msExitFullscreen)
      {
        actions.push({
          label: page.t('pa:layout:fullscreen'),
          icon: 'arrows-alt',
          callback: function()
          {
            screenfull.request(page.canvasView.el);
          }
        });
      }

      actions.push(
        {
          label: page.t('pa:layout:heff'),
          icon: 'smile-o',
          className: page.canvasView.heff ? 'active' : '',
          callback: function()
          {
            page.canvasView.toggleHeff();

            localStorage.setItem('WMES_FACTORY_LAYOUT_HEFF', page.canvasView.heff ? '1' : '0');

            this.querySelector('.btn').classList.toggle('active', page.canvasView.heff);
          }
        },
        {
          label: page.t('pa:settings'),
          icon: 'cogs',
          privileges: 'FACTORY_LAYOUT:MANAGE',
          href: '#factoryLayout;settings?tab=blacklist'
        }
      );

      return actions;
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView(this.canvasView);
    },

    destroy: function()
    {
      $('body').removeClass('no-overflow');
      $('.ft').removeClass('hidden');

      this.model.unload();
      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.canvasView = new FactoryLayoutCanvasView({
        model: this.model,
        heff: localStorage.getItem('WMES_FACTORY_LAYOUT_HEFF') === '1'
      });
    },

    load: function(when)
    {
      return when(this.model.load(false));
    },

    afterRender: function()
    {
      $('body').addClass('no-overflow');
      $('.ft').addClass('hidden');

      this.model.load(false);
    }

  });
});
