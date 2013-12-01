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

    columns: ['name', 'fteMaster', 'fteLeader'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(function(row)
      {
        row.fteMaster = t('core', 'BOOL:' + row.fteMaster);
        row.fteLeader = t('core', 'BOOL:' + row.fteLeader);

        return row;
      });
    }

  });
});
