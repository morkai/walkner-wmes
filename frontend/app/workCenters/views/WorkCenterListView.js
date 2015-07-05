// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      return this.collection.map(function(workCenterModel)
      {
        var row = workCenterModel.toJSON();

        row.orgUnitPath = renderOrgUnitPath(workCenterModel, true);
        row.deactivatedAt = row.deactivatedAt ? time.format(row.deactivatedAt, 'LL') : '-';

        return row;
      });
    }

  });
});
