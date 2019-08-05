// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView'
], function(
  _,
  t,
  time,
  user,
  viewport,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'orderDocumentClients-list is-colored',

    remoteTopics: {
      'orderDocuments.clients.**': 'refreshCollection'
    },

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'prodLine', className: 'is-min'},
      {id: 'station', className: 'is-min is-number'},
      {id: 'fileSource', className: 'is-min'},
      {id: 'orderNo', className: 'is-min'},
      {id: 'orderNc12', className: 'is-min'},
      {id: 'orderName', className: 'is-min'},
      {id: 'documentNc15', className: 'is-min'},
      {id: 'documentName', className: 'is-min'},
      {id: 'lastSeenAt'}
    ],

    serializeActions: function()
    {
      var collection = this.collection;
      var canManage = user.isAllowedTo('DOCUMENTS:MANAGE');

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.delete(model)];

        if (canManage && row.connectedAt !== null)
        {
          actions[0].className = 'disabled';
        }

        return actions;
      };
    }

  });
});
