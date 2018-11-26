// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './ProdSerialNumber'
], function(
  time,
  Collection,
  ProdSerialNumber
) {
  'use strict';

  return Collection.extend({

    model: ProdSerialNumber,

    rowHeight: false,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {
          scannedAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['scannedAt', time.getMoment().subtract(1, 'week').startOf('day').valueOf()]}
          ]
        }
      });
    }

  });
});
