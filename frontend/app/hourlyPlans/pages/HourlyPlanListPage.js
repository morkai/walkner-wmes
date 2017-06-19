// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/fte/views/FteEntryFilterView',
  '../HourlyPlanCollection',
  '../views/HourlyPlanListView'
], function(
  t,
  user,
  pageActions,
  FilteredListPage,
  FteEntryFilterView,
  HourlyPlanCollection,
  HourlyPlanListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FteEntryFilterView,
    ListView: HourlyPlanListView,

    actions: function(layout)
    {
      var privileges = function()
      {
        return user.isAllowedTo('HOURLY_PLANS:MANAGE', 'PROD_DATA:MANAGE');
      };

      return [
        {
          label: t.bound('hourlyPlans', 'PAGE_ACTION:add'),
          href: '#hourlyPlans;add',
          icon: 'plus',
          privileges: privileges
        },
        pageActions.export(layout, this, this.collection),
        {
          label: t.bound('hourlyPlans', 'PAGE_ACTION:planning'),
          href: '#dailyMrpPlans',
          icon: 'calculator',
          privileges: privileges
        }
      ];
    },

    createFilterView: function()
    {
      return new FteEntryFilterView({
        model: {
          rqlQuery: this.collection.rqlQuery
        },
        divisionOnly: true,
        divisionFilter: function(division) { return division.get('type') === 'prod'; }
      });
    }

  });
});
