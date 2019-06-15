// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/pageActions',
  'app/core/pages/FilteredListPage',
  'app/core/views/ListView',
  '../views/KanbanComponentFilterView'
], function(
  pageActions,
  FilteredListPage,
  ListView,
  KanbanComponentFilterView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: KanbanComponentFilterView,

    baseBreadcrumb: '#kanban',

    actions: function()
    {
      return [
        pageActions.jump(this, this.collection, {mode: 'id'})
      ];
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'description', className: 'is-min'},
      {id: 'storageBins', className: 'is-min'},
      {id: 'maxBinQty', className: 'is-min is-number'},
      {id: 'minBinQty', className: 'is-min is-number'},
      {id: 'replenQty', className: 'is-min is-number'},
      {id: 'lastUsageAt', className: 'is-min'},
      {id: 'filler', label: ''}
    ],

    createListView: function()
    {
      var listView = FilteredListPage.prototype.createListView.apply(this, arguments);

      listView.serializeActions = function()
      {
        var collection = this.collection;

        return function(row)
        {
          var model = collection.get(row._id);
          var actions = [ListView.actions.viewDetails(model)];

          return actions;
        };
      };

      return listView;
    }

  });
});
