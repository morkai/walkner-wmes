// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'production.taktTime.snScanned': 'refreshCollection',
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'orderNo', className: 'is-min'},
      {id: 'serialNo', className: 'is-min'},
      {id: 'prodLine', className: 'is-min'},
      {id: 'sapTaktTime', className: 'is-min'},
      {id: 'taktTime', className: 'is-min'},
      {id: 'iptTaktTime', className: 'is-min'},
      {id: 'scannedAt', className: 'is-min'},
      {id: 'iptAt'}
    ],

    serializeActions: function()
    {
      return null;
    }

  });
});
