// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['name', 'parent', 'tags', 'fteDiv', 'inProd', 'clipColor'],

    serializeRows: function()
    {
      var prodTasks = this.collection;
      var topLevel = {};

      prodTasks.forEach(function(prodTask)
      {
        var row = prodTask.toJSON();

        row.tags = row.tags.length ? row.tags.join(', ') : '-';
        row.fteDiv = t('core', 'BOOL:' + !!row.fteDiv);
        row.inProd = t('core', 'BOOL:' + !!row.inProd);

        if (row.clipColor)
        {
          row.clipColor = '<span class="label" style="background: ' + row.clipColor + '">' + row.clipColor + '</span>';
        }

        if (row.parent)
        {
          if (!topLevel[row.parent])
          {
            topLevel[row.parent] = {
              parent: null,
              children: []
            };
          }

          topLevel[row.parent].children.push(row);
        }
        else if (!topLevel[row._id])
        {
          topLevel[row._id] = {
            parent: row,
            children: []
          };
        }
        else if (!topLevel[row._id].parent)
        {
          topLevel[row._id].parent = row;
        }

        var parentTask = prodTasks.get(row.parent);

        row.parent = parentTask ? parentTask.getLabel() : '-';
      });

      var rows = [];

      Object.keys(topLevel).forEach(function(k)
      {
        var item = topLevel[k];

        rows.push(item.parent);
        rows.push.apply(rows, item.children);
      });

      return rows;
    }

  });
});
