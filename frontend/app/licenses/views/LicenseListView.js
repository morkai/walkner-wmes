// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/ListView'
], function(
  time,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable licenses-list',

    columns: [
      {id: '_id', className: 'is-min licenses-id'},
      {id: 'appName', className: 'is-min'},
      {id: 'appVersion', className: 'is-min'},
      {id: 'date', className: 'is-min'},
      {id: 'expireDate', thClassName: 'is-min', tdAttrs: function(row)
      {
        var expireMoment = time.getMoment(row.expireDate, 'L');
        var expireClassName = expireMoment.isValid() && expireMoment.diff() <= 0 ? 'licenses-invalid' : '';

        return {
          className: ['is-min', expireClassName]
        };
      }},
      {id: 'features', className: 'is-min'},
      'licensee'
    ]

  });
});
