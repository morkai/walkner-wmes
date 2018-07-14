// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/kanbanContainers/views/KanbanContainerFilterView',
  'i18n!app/nls/kanbanContainers'
], function(
  pageActions,
  FilteredListPage,
  KanbanContainerFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: KanbanContainerFilterView,

    baseBreadcrumb: '#kanban',

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'name', className: 'is-min'},
      {id: 'length', className: 'is-min is-number'},
      {id: 'width', className: 'is-min is-number'},
      {id: 'height', className: 'is-min is-number'},
      {id: 'filler', label: ''}
    ]

  });
});
