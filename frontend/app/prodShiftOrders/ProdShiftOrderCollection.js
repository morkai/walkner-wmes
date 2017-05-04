// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesEquals',
  '../core/util/matchesProdLine',
  './ProdShiftOrder'
], function(
  time,
  prodLines,
  Collection,
  matchesEquals,
  matchesProdLine,
  ProdShiftOrder
) {
  'use strict';

  return Collection.extend({

    model: ProdShiftOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          creator: 0,
          losses: 0,
          'orderData.bom': 0,
          'orderData.documents': 0
        },
        sort: {
          startedAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['startedAt', time.getMoment().subtract(1, 'months').valueOf()]}
          ]
        }
      });
    },

    hasOrMatches: function(message)
    {
      if (this.get(message._id))
      {
        return true;
      }

      return matchesProdLine(this.rqlQuery, message.prodLine)
        && matchesEquals(this.rqlQuery, 'orderId', message.orderId)
        && matchesEquals(this.rqlQuery, 'operationNo', message.operationNo)
        && matchesEquals(this.rqlQuery, 'shift', message.shift);
    }

  });
});
