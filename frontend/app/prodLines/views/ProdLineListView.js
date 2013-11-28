define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  'i18n!app/nls/prodLines'
], function(
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['workCenter', '_id', 'description'],

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
