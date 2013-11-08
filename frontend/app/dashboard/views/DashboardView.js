define([
  'app/core/View',
  'app/dashboard/templates/dashboard'
], function(
  View,
  dashboardTemplate
) {
  'use strict';

  return View.extend({

    template: dashboardTemplate

  });
});
