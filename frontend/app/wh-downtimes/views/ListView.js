// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: '',

    remoteTopics: function()
    {
      var topics = {};

      topics[this.collection.getTopicPrefix() + '.updated'] = 'refreshCollection';

      return topics;
    },

    columns: [
      {id: 'startedAt', className: 'is-min'},
      {id: 'duration', className: 'is-min'},
      {id: 'user', className: 'is-min'},
      {id: 'reason', className: 'is-min'},
      {id: 'comment'}
    ],

    actions: []

  });
});
