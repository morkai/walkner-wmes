// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  '../views/FactoryLayoutCanvasView'
], function(
  $,
  t,
  View,
  FactoryLayoutCanvasView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        //t.bound('factoryLayout', 'bc:factory')
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
    },

    afterRender: function()
    {
      document.body.classList.add('no-overflow');
    },

    defineModels: function()
    {

    },

    defineViews: function()
    {
      this.canvasView = new FactoryLayoutCanvasView();
    },

    load: function(when)
    {
      return when();
    }

  });
});
