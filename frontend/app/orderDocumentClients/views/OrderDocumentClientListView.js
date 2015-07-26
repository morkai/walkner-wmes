// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  '../OrderDocumentClientCollection'
], function(
  _,
  t,
  time,
  user,
  viewport,
  ListView,
  OrderDocumentClientCollection
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
        var actions = [];

        if (canManage && row.connectedAt === null)
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    }

  });
});
