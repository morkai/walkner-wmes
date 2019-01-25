// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/ListView'
], function(
  t,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'startDate', className: 'is-min'},
      {id: 'endDate', className: 'is-min'},
      'label'
    ]

  });
});
