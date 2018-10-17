// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    columns: [
      'description',
      {id: 'active', className: 'is-min'},
      'line',
      'mrp',
      'nc12',
      'name',
      'components'
    ]

  });
});
