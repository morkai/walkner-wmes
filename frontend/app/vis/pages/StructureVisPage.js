// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  '../views/StructureVisView'
], function(
  $,
  t,
  View,
  StructureVisView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: [
      t.bound('vis', 'BREADCRUMBS:structure')
    ],

    initialize: function()
    {
      this.view = new StructureVisView();
    },

    destroy: function()
    {
      document.body.classList.remove('no-overflow');
    },

    afterRender: function()
    {
      document.body.classList.add('no-overflow');
    },

    load: function(when)
    {
      if (typeof window.d3 !== 'undefined')
      {
        return when();
      }

      var deferred = $.Deferred();

      require(['d3'], function()
      {
        deferred.resolve();
      });

      return when(deferred);
    }

  });
});
