// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    serializeColumns: function()
    {
      return [
        {id: 'createdAt', className: 'is-min'},
        {id: 'creator', className: 'is-min'},
        {id: 'title'}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (user.isAllowedTo(model.getPrivilegePrefix()) + ':MANAGE')
        {
          actions.push(
            ListView.actions.delete(model)
          );
        }

        return actions;
      };
    },

  });
});
