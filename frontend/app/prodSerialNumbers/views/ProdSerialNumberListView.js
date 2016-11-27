// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/ListView'
], function(
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'prodSerialNumbers.created.**': 'refreshCollection',
    },

    serializeColumns: function()
    {
      var columns = [
        {id: '_id', className: 'is-min'},
        {id: 'orderNo', className: 'is-min'},
        {id: 'serialNo', className: 'is-min'},
        {id: 'prodLine', className: 'is-min'}
      ];

      if (user.isAllowedTo('PROD_DATA:VIEW'))
      {
        columns.push({id: 'sapTaktTime', className: 'is-min'});
      }

      columns.push(
        {id: 'taktTime', className: 'is-min'},
        {id: 'iptTaktTime', className: 'is-min'},
        {id: 'scannedAt', className: 'is-min'},
        {id: 'iptAt'}
      );

      return columns;
    },

    serializeActions: function()
    {
      return null;
    }

  });
});
