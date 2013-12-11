define([
  'app/data/divisions',
  'app/data/views/renderOrgUnitPath',
  'app/core/views/ListView',
  'i18n!app/nls/divisions'
], function(
  divisions,
  renderOrgUnitPath,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['division', 'name', 'prodTaskTags'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(function(row)
      {
        row.division = renderOrgUnitPath(divisions.get(row.division), true, false);

        row.prodTaskTags =
          row.prodTaskTags && row.prodTaskTags.length ? row.prodTaskTags.join(', ') : null;

        return row;
      });
    }

  });
});
