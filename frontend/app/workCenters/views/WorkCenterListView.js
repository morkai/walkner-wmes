// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/time',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  user,
  time,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  function createDescriptionTdAttrs(row)
  {
    return row.deactivatedAt === '-' ? '' : 'class="is-deleted"';
  }

  return ListView.extend({

    deactivatedVisible: false,

    columns: [
      'orgUnitPath',
      {id: '_id', className: 'is-min'},
      {id: 'description', tdAttrs: createDescriptionTdAttrs},
      {id: 'deactivatedAt', className: 'is-min'}
    ],

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
        .filter(function(workCenter)
        {
          return deactivatedVisible || !workCenter.get('deactivatedAt');
        })
        .map(function(workCenter)
        {
          var row = workCenter.toJSON();

          row.orgUnitPath = renderOrgUnitPath(workCenter, true);
          row.deactivatedAt = row.deactivatedAt ? time.format(row.deactivatedAt, 'LL') : '-';

          return row;
        });
    },

    toggleDeactivated: function(state)
    {
      this.deactivatedVisible = state;

      this.render();
    }

  });
});
