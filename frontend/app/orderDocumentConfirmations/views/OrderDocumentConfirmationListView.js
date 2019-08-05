// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'orderDocumentConfirmations-list',

    remoteTopics: {
      'orderDocuments.confirmed.**': 'refreshCollection'
    },

    columns: [
      {id: 'time', className: 'is-min'},
      {id: 'line', className: 'is-min'},
      {id: 'station', className: 'is-min is-number'},
      {id: 'nc15', className: 'is-min'},
      {id: 'name', className: 'is-min'},
      {id: 'orderNo', className: 'is-min'},
      {id: 'user'}
    ],

    serializeActions: function()
    {
      return null;
    }

  });
});
