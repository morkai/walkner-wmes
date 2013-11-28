define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  'i18n!app/nls/prodTasks'
], function(
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['mrpController', 'name'],

    serializeRows: function()
    {
      return this.collection.map(function(prodFlowModel)
      {
        var row = prodFlowModel.toJSON();

        row.mrpController = renderOrgUnitPath(prodFlowModel, true);

        return row;
      });
    }

  });
});
