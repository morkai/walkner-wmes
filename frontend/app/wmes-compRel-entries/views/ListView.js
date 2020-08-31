// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/ListView'
], function(
  _,
  $,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'compRel-entries-list is-clickable is-colored',

    remoteTopics: function()
    {
      var topics = {};
      var topicPrefix = this.collection.getTopicPrefix();

      if (topicPrefix && this.options.autoRefresh !== false)
      {
        topics[topicPrefix + '.added'] = 'refreshCollection';
        topics[topicPrefix + '.updated.*'] = 'onModelUpdated';
        topics[topicPrefix + '.deleted'] = 'onModelDeleted';
      }

      return topics;
    },

    events: _.assign({

      'click .is-filter': function(e)
      {
        this.trigger('showFilter', e.currentTarget.dataset.columnId);
      }

    }, ListView.prototype.events),

    serializeColumns: function()
    {
      return [
        {id: 'rid', className: 'is-min is-number', thClassName: 'is-filter'},
        {id: 'creator', className: 'is-min', thClassName: 'is-filter'},
        {id: 'mrps', className: 'is-min', thClassName: 'is-filter'},
        {id: 'oldComponent', className: 'is-min', thClassName: 'is-filter'},
        {id: 'newComponent', className: 'is-min', thClassName: 'is-filter'},
        {id: 'reason', className: 'is-min'},
        '-'
      ];
    },

    onModelUpdated: function(message)
    {
      if (Object.keys(message.change.data).length)
      {
        this.refreshCollection(message);
      }
    }

  });
});
