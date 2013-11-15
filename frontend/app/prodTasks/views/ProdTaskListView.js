define([
  'app/i18n',
  'app/user',
  'app/data/aors',
  'app/core/views/ListView',
  'i18n!app/nls/prodTasks'
], function(
  t,
  user,
  aors,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['name', 'aors'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(function(row)
      {
        row.className = 'prodTaskList-item';
        row.aors = row.aors
          .map(function(aorId)
          {
            var aor = aors.get(aorId);

            if (aor)
            {
              return '<span class="label label-default prodTaskList-label">'
                + aor.get('name')
                + '</span>';
            }

            return '';
          })
          .filter(function(aor) { return aor !== ''; })
          .join('');

        return row;
      });
    }

  });
});
