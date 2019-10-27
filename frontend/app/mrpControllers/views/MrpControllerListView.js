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

    deactivatedVisible: false,

    columns: function()
    {
      return [
        {id: 'subdivision', className: 'is-min'},
        {id: '_id', className: 'is-min'},
        {id: 'inout', className: 'is-min'},
        {id: 'description', tdAttrs: function(row)
        {
          return {
            className: row.deactivatedAt ? 'is-deleted' : ''
          };
        }},
        {id: 'deactivatedAt', className: 'is-min'},
        {id: 'replacedBy', className: 'is-min'}
      ];
    },

    serializeActions: function()
    {
      var collection = this.collection;
      var nlsDomain = collection.getNlsDomain();

      return function(row)
      {
        var model = collection.get(row._id);
        var active = !model.get('deactivatedAt') || user.data.super;
        var actions = [];

        actions.push(ListView.actions.viewDetails(model, nlsDomain));

        if (active && user.isAllowedTo(model.getPrivilegePrefix() + ':MANAGE'))
        {
          actions.push(
            ListView.actions.edit(model, nlsDomain),
            ListView.actions.delete(model, nlsDomain)
          );
        }

        return actions;
      };
    },

    serializeRows: function()
    {
      var deactivatedVisible = this.deactivatedVisible;

      return this.collection
        .filter(function(mrpController)
        {
          return deactivatedVisible || !mrpController.get('deactivatedAt');
        })
        .map(function(mrpController)
        {
          return mrpController.serializeRow();
        });
    },

    toggleDeactivated: function(state)
    {
      this.deactivatedVisible = state;

      this.render();
    }

  });
});
