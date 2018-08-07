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
      {id: 'name', className: 'is-min'},
      {id: 'workCenter', className: 'is-min'},
      {id: 'family', className: 'is-min'},
      'lines'
    ]

  });
});
