// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/ListView'
], function(
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    serializeColumns: function()
    {
      var columns = [
        {id: 'vendor', className: 'is-min'},
        {id: 'nc12', className: 'is-min'},
        {id: 'value', className: 'is-min'},
        'unit'
      ];

      if (user.data.vendor)
      {
        columns.shift();
      }

      return columns;
    }

  });
});
