// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/templates/listPage',
  '../views/ProdLineStateDisplayOptionsView',
  '../views/ProdLineStateListView'
], function(
  _,
  $,
  t,
  View,
  bindLoadingMessage,
  listPageTemplate,
  ProdLineStateDisplayOptionsView,
  ProdLineStateListView
) {
  'use strict';

  return View.extend({

    pageId: 'prodLineStateList',

    template: listPageTemplate,

    layoutName: 'page',

    localTopics: {
      'socket.connected': function()
      {
        this.model.load(true);
      }
    },

    breadcrumbs: [
      {
        label: t.bound('factoryLayout', 'bc:layout'),
        href: '#factoryLayout'
      },
      t.bound('factoryLayout', 'bc:list')
    ],

    actions: function()
    {
      return [{
        label: t.bound('factoryLayout', 'pa:settings'),
        icon: 'cogs',
        privileges: 'FACTORY_LAYOUT:MANAGE',
        href: '#factoryLayout;settings?tab=blacklist'
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();

      this.setView('.filter-container', this.displayOptionsView);
      this.setView('.list-container', this.listView);
    },

    destroy: function()
    {
      this.model.unload();
      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.listView = new ProdLineStateListView({
        model: this.model,
        displayOptions: this.displayOptions
      });

      this.displayOptionsView = new ProdLineStateDisplayOptionsView({
        model: this.displayOptions
      });
    },

    defineBindings: function()
    {
      this.listenTo(this.displayOptions, 'change', this.onDisplayOptionsChange);
    },

    load: function(when)
    {
      return when(this.model.load(false));
    },

    afterRender: function()
    {
      this.model.load(false);
    },

    onDisplayOptionsChange: function()
    {
      this.broker.publish('router.navigate', {
        url: '/factoryLayout;list?' + this.displayOptions.serializeToString()
      });
    }


  });
});
