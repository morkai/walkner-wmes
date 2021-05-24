// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    columns: [
      {id: 'rid', className: 'is-min'},
      {id: 'recipient', className: 'is-min'},
      {id: 'subject', className: 'is-overflow w300'},
      {id: 'amount', className: 'is-min', tdClassName: 'text-right'},
      {id: 'createdAt', className: 'is-min'},
      {id: 'creator', className: 'is-min'},
      {id: 'paidAt', className: 'is-min'},
      {id: 'payer', className: 'is-min'},
      '-'
    ],

    actions: []

  });
});
