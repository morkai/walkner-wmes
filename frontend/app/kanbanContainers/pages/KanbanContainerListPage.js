// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/kanbanContainers/views/KanbanContainerFilterView'
], function(
  _,
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
      {id: 'image', className: 'kanbanContainers-image'},
      {id: 'filler', label: ''}
    ],

    events: _.assign({

      'click img': function(e)
      {
        window.open(e.currentTarget.src);

        return false;
      }

    }, FilteredListPage.prototype.events)

  });
});
