define([
  'app/i18n',
  'app/core/View',
  '../views/CurrentHourlyPlanView',
  'i18n!app/nls/hourlyPlans'
], function(
  t,
  View,
  CurrentHourlyPlanView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'currentHourlyPlan',

    breadcrumbs: [
      {
        label: t.bound('hourlyPlans', 'BREADCRUMBS:entryList'),
        href: '#hourlyPlans'
      },
      t.bound('hourlyPlans', 'BREADCRUMBS:currentEntry')
    ],

    initialize: function()
    {
      this.view = new CurrentHourlyPlanView();
    }

  });
});
