// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: [
      {id: 'code', className: 'is-min', tdClassName: 'text-fixed'},
      {id: 'name', className: 'is-min'},
      {id: 'quantity', className: 'is-min', tdClassName: 'text-right'},
      {id: 'productFamily', className: 'is-min', tdClassName: 'text-fixed'},
      {id: 'lampColor', className: 'is-min', tdClassName: 'text-fixed'},
      {id: 'ledCount', className: 'is-min', tdClassName: 'text-fixed'},
      '-'
    ],

    remoteTopics: function()
    {
      const topics = ListView.prototype.remoteTopics.apply(this, arguments);

      topics[`${this.collection.getTopicPrefix()}.imported`] = () => this.refreshCollectionNow();

      return topics;
    }

  });
});
