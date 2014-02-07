define([
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView'
], function(
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['orgUnitPath', '_id', 'description'],

    serializeRows: function()
    {
      return this.collection.map(function(workCenterModel)
      {
        var row = workCenterModel.toJSON();

        row.orgUnitPath = renderOrgUnitPath(workCenterModel, true);

        return row;
      });
    }

  });
});
