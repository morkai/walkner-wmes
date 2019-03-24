// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: '',

    remoteTopics: {
      'luma2.events.saved': 'refreshCollection'
    },

    serializeColumns: function()
    {
      return [
        {id: 'time', className: 'is-min'},
        {id: 'type', className: 'is-min'},
        {id: 'line', className: 'is-min'},
        {id: 'station', className: 'is-min'},
        {id: 'program', className: 'is-min'},
        {id: 'order', className: 'is-min'},
        {id: 'pce'}
      ];
    },

    serializeActions: function()
    {
      return null;
    }

  });
});
