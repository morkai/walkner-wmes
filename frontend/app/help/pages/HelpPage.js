// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../HelpSettingCollection',
  '../HelpFileCollection',
  '../views/HelpTreeView',
  'app/help/templates/page'
], function(
  $,
  View,
  bindLoadingMessage,
  HelpSettingCollection,
  HelpFileCollection,
  HelpTreeView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        this.t('bc:base')
      ];
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: this.t('pa:edit'),
          icon: 'edit',
          privileges: 'HELP:MANAGE',
          callback: function()
          {
            console.log('EDIT', this, arguments);
          }
        }
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('#-tree', this.treeView);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(
        new HelpSettingCollection(null, {pubsub: this.pubsub.sandbox()}),
        this
      );

      this.files = this.model = bindLoadingMessage(
        new HelpFileCollection(null, {settings: this.settings}),
        this
      );
    },

    defineViews: function()
    {
      this.treeView = new HelpTreeView({model: this.files});
    },

    defineBindings: function()
    {
      $(window)
        .on('resize.' + this.idPrefix, this.onWindowResize.bind(this))
        .on('scroll.' + this.idPrefix, this.onWindowScroll.bind(this));
    },

    load: function(when)
    {
      var page = this;

      return when(page.settings.fetchIfEmpty(function()
      {
        return page.model.fetch({reset: true});
      }));
    },

    afterRender: function()
    {
      this.resize();
    },

    onWindowResize: function()
    {
      this.resize();
    },

    onWindowScroll: function()
    {
      this.resize();
    },

    resize: function()
    {
      var $tree = this.$id('tree');
      var top = $('.hd').outerHeight(true) + 15 - window.scrollY;

      if (top < 15)
      {
        top = 15;
      }

      $tree[0].style.top = top + 'px';
      $tree[0].style.height = (window.innerHeight - 15 - top) + 'px';
    }

  });
});
