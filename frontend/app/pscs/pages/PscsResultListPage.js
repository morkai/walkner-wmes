// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/PscsResultFilterView',
  '../views/PscsResultListView'
], function(
  t,
  pageActions,
  FilteredListPage,
  PscsResultFilterView,
  PscsResultListView
) {
  'use strict';

  return FilteredListPage.extend({

    baseBreadcrumb: '#pscs',
    FilterView: PscsResultFilterView,
    ListView: PscsResultListView,

    actions: function(layout)
    {
      return [
        pageActions.export(layout, this, this.collection, false)
      ];
    }

  });
});
