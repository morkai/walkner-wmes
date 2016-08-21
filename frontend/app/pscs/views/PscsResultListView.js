// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/views/ListView'
], function(
  t,
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'pscs-list is-colored',

    serializeColumns: function()
    {
      return [
        {id: 'rid', className: 'is-min is-number'},
        {id: 'status', className: 'is-min'},
        {id: 'user', className: 'is-min'},
        {id: 'startedAt', className: 'is-min'},
        {id: 'duration', className: 'is-min'},
        {id: 'a1', className: 'is-min'},
        {id: 'a2', className: 'is-min'},
        {id: 'a3', className: 'is-min'},
        {id: 'a4', className: 'is-min'},
        {id: 'a5', className: 'is-min'},
        {id: 'a6', className: 'is-min'},
        {id: 'a7', className: 'is-min'},
        {id: 'a8', className: 'is-min'},
        {id: 'creator'}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;
      var canManage = user.isAllowedTo('PSCS:MANAGE');

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [];

        if (canManage)
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    }

  });
});
