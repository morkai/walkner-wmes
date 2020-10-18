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
          id: '_id',
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
          id: 'implementers',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'workplace',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'division',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'building',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'location',
          className: 'is-overflow w150',
          thClassName: 'is-filter'
        },
        {
          id: 'kind',
          min: 1,
          thClassName: 'is-filter'
        },
        {
          id: 'subject',
          className: 'is-overflow w200'
        },
        '-'
      ];
    }

  });
});
