// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/ProdLineStateListView'
], function(
  _,
  $,
  t,
  View,
  bindLoadingMessage,
  ProdLineStateListView
) {
  'use strict';

  return View.extend({

    pageId: 'prodLineStateList',

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

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView(this.listView);
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
        listOptions: this.listOptions
      });
    },

    load: function(when)
    {
      return when(this.model.load(false));
    }

  });
});
