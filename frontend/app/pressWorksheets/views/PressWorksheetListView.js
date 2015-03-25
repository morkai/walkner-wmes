// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/user',
  'app/core/views/ListView'
], function(
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'companies.synced': 'render'
    },

    columns: [
      {id: 'rid', className: 'is-min'},
      {id: 'type', className: 'is-min'},
      {id: 'divisions', className: 'is-min'},
      {id: 'date', className: 'is-min'},
      {id: 'shift', className: 'is-min'},
      {id: 'master', className: 'is-min'},
      'operator'
    ],

    serializeActions: function()
    {
      var collection = this.collection;
      var canManageProdData = user.isAllowedTo('PROD_DATA:MANAGE');
      var eightHours = 8 * 3600 * 1000;
      var now = Date.now();

      function canManage(model)
      {
        if (canManageProdData)
        {
          return true;
        }

        return user.isAllowedTo('PRESS_WORKSHEETS:MANAGE')
          && user.data._id === model.get('creator').id
          && Date.parse(model.get('createdAt')) + eightHours > now;
      }

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (canManage(model))
        {
          actions.push(ListView.actions.edit(model));
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    }

  });
});
