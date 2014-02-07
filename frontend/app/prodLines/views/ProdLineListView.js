define([
  'app/i18n',
  'app/user',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  t,
  user,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['workCenter', '_id', 'description'],

    serializeActions: function()
    {
      var collection = this.collection;
      var nlsDomain = collection.getNlsDomain();

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [
          {
            id: 'production',
            icon: 'desktop',
            label: t(nlsDomain, 'LIST:ACTION:production'),
            href: '#production/' + model.id
          },
          ListView.actions.viewDetails(model, nlsDomain)
        ];

        if (user.isAllowedTo(model.getPrivilegePrefix() + ':MANAGE'))
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

        return row;
      });
    }

  });
});
