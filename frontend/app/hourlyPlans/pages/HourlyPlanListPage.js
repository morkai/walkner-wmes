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
        pageActions.export(layout, this, this.collection),
        {
          label: t.bound('hourlyPlans', 'PAGE_ACTION:planning'),
          href: '#planning/plans',
          icon: 'calculator',
          privileges: 'PLANNING:VIEW'
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
