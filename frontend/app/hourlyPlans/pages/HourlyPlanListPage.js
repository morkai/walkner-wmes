// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  '../HourlyPlanCollection',
  '../views/HourlyPlanListView',
  'app/fte/views/FteEntryFilterView',
  'app/core/templates/listPage'
], function(
  t,
  user,
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
      t.bound('hourlyPlans', 'BREADCRUMBS:browse')
    ],

    actions: function(layout)
    {
      return [
        {
          label: t.bound('hourlyPlans', 'PAGE_ACTION:add'),
          href: '#hourlyPlans;add',
          icon: 'plus',
          privileges: function()
          {
            return user.isAllowedTo('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');
          }
        },
        pageActions.export(layout, this, this.collection)
      ];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.list-container', this.listView);
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

      this.listView.refreshCollectionNow();

      var newRqlQueryStr = newRqlQuery.toString();

      this.broker.publish('router.navigate', {
        url: this.collection.genClientUrl() + '?' + newRqlQueryStr,
        trigger: false,
        replace: true
      });
    }

  });
});
