// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  '../views/KanbanPrintQueueFilterView',
  '../views/KanbanPrintQueueListView'
], function(
  pageActions,
  FilteredListPage,
  KanbanPrintQueueFilterView,
  KanbanPrintQueueListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: KanbanPrintQueueFilterView,

    baseBreadcrumb: '#kanban',

    actions: [],

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.collection.setUpPubsub(this.pubsub);
    },

    createListView: function()
    {
      return new KanbanPrintQueueListView({collection: this.collection});
    }

  });
});
