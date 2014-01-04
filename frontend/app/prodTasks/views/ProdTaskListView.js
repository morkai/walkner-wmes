define([
  'app/i18n',
  'app/core/views/ListView',
  'i18n!app/nls/prodTasks'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['name', 'tags', 'fteDiv'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(function(row)
      {
        row.tags = row.tags.length ? row.tags.join(', ') : null;
        row.fteDiv = t('core', 'BOOL:' + !!row.fteDiv);

        return row;
      });
    }

  });
});
