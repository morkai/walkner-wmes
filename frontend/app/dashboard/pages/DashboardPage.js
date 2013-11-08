define([
  'app/core/View',
  '../views/DashboardView'
], function(
  View,
  DashboardView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'dashboard',

    initialize: function()
    {
      this.view = new DashboardView();
    }

  });
});
