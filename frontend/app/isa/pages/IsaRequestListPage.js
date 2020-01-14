// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/IsaRequestFilterView',
  '../views/IsaRequestListView'
], function(
  t,
  pageActions,
  FilteredListPage,
  IsaRequestFilterView,
  IsaRequestListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: IsaRequestFilterView,
    ListView: IsaRequestListView,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('isa', 'BREADCRUMB:base'),
          href: '#isa'
        },
        t.bound('isa', 'BREADCRUMB:requests')
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
