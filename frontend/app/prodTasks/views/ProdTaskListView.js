// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
