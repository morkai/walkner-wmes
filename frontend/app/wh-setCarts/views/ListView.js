// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: function()
    {
      var topics = {};

      topics[this.collection.getTopicPrefix() + '.updated'] = 'refreshCollection';

      return topics;
    },

    columns: [
      {id: 'status', className: 'is-min'},
      {id: 'kind', className: 'is-min'},
      {id: 'date', className: 'is-min'},
      {id: 'set', className: 'is-min'},
      {id: 'line', className: 'is-min', tdClassName: 'text-fixed', titleProperty: 'redirLine'},
      {id: 'cart', className: 'is-min'},
      {id: 'orders', className: 'is-min'},
      {id: 'completedAt', className: 'is-min'},
      {id: 'deliveringAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      {id: 'completedBy', className: 'is-min'},
      {id: 'deliveringBy', className: 'is-min'},
      '-'
    ],

    actions: []

  });
});
