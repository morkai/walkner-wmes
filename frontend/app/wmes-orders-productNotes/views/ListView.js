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
      {id: 'codes', className: 'is-min'},
      {id: 'target', className: 'is-min'},
      {id: 'priority', className: 'is-min'},
      'text'
    ]

  });
});
