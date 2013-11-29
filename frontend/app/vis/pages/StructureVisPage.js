define([
  'jquery',
  'app/i18n',
  'app/core/View',
  '../views/StructureVisView',
  'i18n!app/nls/vis'
], function(
  $,
  t,
  View,
  StructureVisView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'structureVis',

    breadcrumbs: [
      t.bound('vis', 'BREADCRUMBS:structure')
    ],

    initialize: function()
    {
      this.view = new StructureVisView();
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
