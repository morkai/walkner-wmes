// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'wh-events-list',

    remoteTopics: function()
    {
      var topics = {};

      topics[this.collection.getTopicPrefix() + '.updated'] = 'refreshCollection';

      return topics;
    },

    columns: [
      {id: 'time', className: 'is-min'},
      {id: 'type', className: 'is-min'},
      {id: 'user', className: 'is-min'},
      {id: 'whUser', className: 'is-min'},
      {id: 'data'}
    ],

    actions: []

  });
});
