// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/wmes-osh-common/views/ListView'
], function(
  viewport,
  ListView
) {
  'use strict';

  return ListView.extend({

    serializeColumns: function()
    {
      return [
        {
          id: 'rid',
          min: 1,
          thClassName: 'is-filter',
          tdClassName: 'is-number'
        },
        {
          id: 'status',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'createdAt',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'creator',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'date',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'company',
          min: 1
        },
        {
          id: 'locationPath',
          className: 'is-overflow w300',
          thClassName: 'is-filter'
        },
        {
          id: 'observationKind',
          min: 1,
          thClassName: 'is-filter'
        },
        '-'
      ];
    }

  });
});
