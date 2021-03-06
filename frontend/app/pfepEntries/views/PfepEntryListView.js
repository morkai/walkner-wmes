// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'pfepEntries-list is-clickable',

    remoteTopics: function()
    {
      var topics = ListView.prototype.remoteTopics.apply(this, arguments);

      topics['pfep.entries.imported'] = 'refreshCollectionNow';

      return topics;
    },

    serializeColumns: function()
    {
      return [
        {id: 'rid', tdClassName: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'date', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'nc12', tdClassName: 'is-min text-fixed', thClassName: 'is-filter'},
        {id: 'description', tdClassName: 'is-overflow w250'},
        {id: 'unit', tdClassName: 'is-min'},
        {id: 'packType', tdClassName: 'is-min', thClassName: 'is-filter'},
        {id: 'externalPackQty', tdClassName: 'is-min is-number'},
        {id: 'packSize', tdClassName: 'is-min is-number text-center'},
        {id: 'packGrossWeight', tdClassName: 'is-min is-number'},
        {id: 'componentNetWeight', tdClassName: 'is-min is-number'},
        {id: 'componentGrossWeight', tdClassName: 'is-min is-number'},
        {id: 'internalPackQty', tdClassName: 'is-min is-number'},
        {id: 'qtyPerLayer', tdClassName: 'is-min is-number'},
        {id: 'qtyOnPallet', tdClassName: 'is-min is-number'},
        {id: 'palletSize', tdClassName: 'is-min is-number text-center'},
        {id: 'moq', tdClassName: 'is-min is-number'},
        {id: 'roundingValue', tdClassName: 'is-min is-number'},
        {id: 'vendor', tdClassName: 'is-overflow w250', thClassName: 'is-filter'},
        {id: 'creator', tdClassName: 'is-overflow w250', thClassName: 'is-filter'},
        {id: 'notes', tdClassName: 'is-overflow w250'}
      ];
    }

  });
});
