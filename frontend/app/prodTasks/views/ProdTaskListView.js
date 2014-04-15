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

    columns: ['name', 'tags', 'fteDiv', 'clipColor'],

    serializeRows: function()
    {
      return this.collection.toJSON().map(function(row)
      {
        row.tags = row.tags.length ? row.tags.join(', ') : null;
        row.fteDiv = t('core', 'BOOL:' + !!row.fteDiv);

        if (row.clipColor)
        {
          row.clipColor = '<span class="label" style="background: ' + row.clipColor + '">'
            + row.clipColor
            + '</span>';
        }

        return row;
      });
    }

  });
});
