// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/IsaEventFilterView',
  '../views/IsaEventListView'
], function(
  t,
  pageActions,
  FilteredListPage,
  IsaEventFilterView,
  IsaEventListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: IsaEventFilterView,
    ListView: IsaEventListView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('isa', 'BREADCRUMB:base'),
          href: '#isa'
        },
        t.bound('isa', 'BREADCRUMB:events')
      ];
    },

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection)
      ];
    }

  });
});
