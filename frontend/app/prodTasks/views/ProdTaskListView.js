// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/ListView',
  'app/core/util/colorLabel'
], function(
  t,
  ListView,
  colorLabel
) {
  'use strict';

  return ListView.extend({

    columns: ['name', 'parent', 'tags', 'fteDiv', 'inProd', 'clipColor'],

    serializeRows: function()
    {
      var prodTasks = this.collection;

      return prodTasks.sort().map(function(prodTask)
      {
        var row = prodTask.toJSON();

        row.tags = row.tags.length ? row.tags.join(', ') : '-';
        row.fteDiv = t('core', 'BOOL:' + !!row.fteDiv);
        row.inProd = t('core', 'BOOL:' + !!row.inProd);

        if (row.clipColor)
        {
          row.clipColor = colorLabel(row.clipColor);
        }

        var parentTask = prodTasks.get(row.parent);

        row.parent = parentTask ? parentTask.getLabel() : '-';

        return row;
      });
    }

  });
});
