// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    columns: [
      {id: 'nc12', className: 'is-min'},
      {id: 'weight', className: 'is-min'},
      'description'
    ]

  });
});
