define([
  'jquery',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../HourlyPlanCollection',
  '../views/HourlyPlanListView',
  'app/fte/views/FteEntryFilterView',
  'app/hourlyPlans/templates/listPage'
], function(
  $,
  t,
  bindLoadingMessage,
  pageActions,
  View,
  HourlyPlanCollection,
  HourlyPlanListView,
  FteEntryFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'hourlyPlanList',

    breadcrumbs: [
      t.bound('hourlyPlans', 'BREADCRUMBS:entryList')
    ],

    actions: function(layout)
    {
      return [
        {
          label: t.bound('hourlyPlans', 'PAGE_ACTION:currentEntry'),
          href: '#hourlyPlans/current',
          icon: 'edit',
          privileges: 'HOURLY_PLANS:MANAGE'
        },
        pageActions.export(layout, this, this.collection)
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.hourlyPlans-list-container', this.listView);
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(
        new HourlyPlanCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.filterView = new FteEntryFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        },
        divisionOnly: true,
        divisionFilter: function(division)
        {
          return division.get('type') === 'prod';
        }
      });

      this.listView = new HourlyPlanListView({collection: this.collection});

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.collection.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      var newRqlQueryStr = newRqlQuery.toString();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQueryStr,
        trigger: false,
        replace: true
      });
    }

  });
});
