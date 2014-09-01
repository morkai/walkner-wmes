// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/FactoryLayoutCanvasView'
], function(
  $,
  t,
  View,
  bindLoadingMessage,
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
        t.bound('factoryLayout', 'bc:layout')
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView(this.canvasView);
    },

    destroy: function()
    {
      document.body.classList.remove('no-overflow');

      this.model.unload();
      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.canvasView = new FactoryLayoutCanvasView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.load(false));
    },

    afterRender: function()
    {
      document.body.classList.add('no-overflow');

      this.model.load(false);
    }

  });
});
