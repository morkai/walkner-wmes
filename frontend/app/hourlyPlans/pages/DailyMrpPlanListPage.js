// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/pages/FilteredListPage',
  '../views/DailyMrpPlanListFilterView',
  '../views/DailyMrpPlanListView'
], function(
  $,
  t,
  FilteredListPage,
  DailyMrpPlanListFilterView,
  DailyMrpPlanListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: DailyMrpPlanListFilterView,
    ListView: DailyMrpPlanListView,

    actions: [
      {
        label: t.bound('hourlyPlans', 'PAGE_ACTION:settings'),
        icon: 'cogs',
        privileges: 'PROD_DATA:MANAGE',
        href: '#hourlyPlans;settings?tab='
      }
    ],

    breadcrumbs: [
      t.bound('hourlyPlans', 'BREADCRUMBS:dailyMrpPlans')
    ],

    load: function(when)
    {
      return when(
        this.loadStyles(),
        this.collection.fetch({reset: true})
      );
    },

    loadStyles: function()
    {
      var deferred = $.Deferred();
      var $head = $('head');

      if ($head.find('link[href$="planning.css"]').length)
      {
        deferred.resolve();
      }
      else
      {
        $('<link rel="stylesheet" href="/app/hourlyPlans/assets/planning.css">')
          .on('load', function() { deferred.resolve(); })
          .appendTo($head);
      }

      return deferred.promise();
    }

  });
});
