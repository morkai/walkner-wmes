// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/time',
  'app/orgUnits/util/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  t,
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
      'workCenter',
      {id: '_id', className: 'is-min'},
      {id: 'description', tdAttrs: createDescriptionTdAttrs},
      {id: 'inventoryNo', className: 'is-min'},
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

        if (active)
        {
          actions.push({
            id: 'production',
            icon: 'desktop',
            label: t(nlsDomain, 'LIST:ACTION:production'),
            href: '#production/' + model.id
          });
        }

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
        .filter(function(prodLine)
        {
          return deactivatedVisible || !prodLine.get('deactivatedAt');
        })
        .map(function(prodLine)
        {
          var row = prodLine.toJSON();

          row.orgUnits = renderOrgUnitPath(prodLine);
          row.orgUnitsText = renderOrgUnitPath(prodLine, false, false);
          row.workCenter = renderOrgUnitPath(prodLine, true);
          row.inventoryNo = row.inventoryNo || '-';
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
