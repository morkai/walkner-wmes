// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/time',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  user,
  time,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    deactivatedVisible: false,

    columns: function()
    {
      return [
        {id: 'orgUnitPath', className: 'is-min'},
        {id: '_id', className: 'is-min'},
        {id: 'description', tdAttrs: function(row)
        {
          return {
            className: row.deactivatedAt ? 'is-deleted' : ''
          };
        }},
        {id: 'deactivatedAt', className: 'is-min'}
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
        .filter(function(workCenter)
        {
          return deactivatedVisible || !workCenter.get('deactivatedAt');
        })
        .map(function(workCenter)
        {
          var row = workCenter.toJSON();

          row.orgUnitPath = renderOrgUnitPath(workCenter, true);
          row.orgUnitsText = renderOrgUnitPath(workCenter, false, false);
          row.deactivatedAt = row.deactivatedAt ? time.format(row.deactivatedAt, 'LL') : '-';

          return row;
        })
        .sort(function(a, b)
        {
          return a.orgUnitsText.localeCompare(b.orgUnitsText, undefined, {numeric: true, ignorePunctuation: true});
        });
    },

    toggleDeactivated: function(state)
    {
      this.deactivatedVisible = state;

      this.render();
    }

  });
});
