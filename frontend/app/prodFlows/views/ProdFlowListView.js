// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/time',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/ListView',
  './decorateProdFlow'
], function(
  user,
  time,
  renderOrgUnitPath,
  ListView,
  decorateProdFlow
) {
  'use strict';

  function createNameTdAttrs(row)
  {
    return row.deactivatedAt === '-' ? '' : 'class="is-deleted"';
  }

  return ListView.extend({

    deactivatedVisible: false,

    columns: [
      {id: 'subdivision', className: 'is-min'},
      {id: 'mrpControllers', className: 'is-min'},
      {id: 'name', tdAttrs: createNameTdAttrs},
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
        .filter(function(prodFlow)
        {
          return deactivatedVisible || !prodFlow.get('deactivatedAt');
        })
        .map(function(prodFlow)
        {
          return decorateProdFlow(prodFlow, true);
        })
        .sort(function(a, b)
        {
          return a.orgUnitsText.localeCompare(b.orgUnitsText, undefined, {
            numeric: true,
            ignorePunctuation: true
          });
        });
    },

    toggleDeactivated: function(state)
    {
      this.deactivatedVisible = state;

      this.render();
    }

  });
});
