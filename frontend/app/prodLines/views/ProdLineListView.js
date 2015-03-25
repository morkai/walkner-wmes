// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  'app/time',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  t,
  user,
  time,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: [
      'workCenter',
      {id: '_id', className: 'is-min'},
      'description',
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
      return this.collection.map(function(prodLineModel)
      {
        var row = prodLineModel.toJSON();

        row.workCenter = renderOrgUnitPath(prodLineModel, true);
        row.deactivatedAt = row.deactivatedAt ? time.format(row.deactivatedAt, 'LL') : '-';

        return row;
      });
    }

  });
});
