// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  '../core/util/matchesDate',
  '../core/util/matchesEquals',
  './ProdSerialNumber'
], function(
  time,
  Collection,
  matchesDate,
  matchesEquals,
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
        limit: -1337,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['scannedAt', time.getMoment().subtract(1, 'week').startOf('day').valueOf()]}
          ]
        }
      });
    },

    matches: function(message)
    {
      var rql = this.rqlQuery;

      return matchesDate(rql, 'scannedAt', message.scannedAt)
        && matchesEquals(rql, 'serialNo', message.serialNo)
        && matchesEquals(rql, 'orderNo', message.orderNo)
        && matchesEquals(rql, 'prodLine', message.prodLine);
    }

  });
});
