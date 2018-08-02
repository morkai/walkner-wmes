// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/kanbanSupplyAreas/views/KanbanSupplyAreaFilterView',
  'i18n!app/nls/kanbanSupplyAreas'
], function(
  pageActions,
  FilteredListPage,
  KanbanSupplyAreaFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: KanbanSupplyAreaFilterView,

    baseBreadcrumb: '#kanban',

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'name', className: 'is-min'},
      {id: 'markerColor', className: 'is-min'},
      'lines'
    ]

  });
});
