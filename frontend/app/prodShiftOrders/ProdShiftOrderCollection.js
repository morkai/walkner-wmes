// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesEquals',
  '../core/util/matchesProdLine',
  '../orgUnits/util/limitOrgUnits',
  './ProdShiftOrder'
], function(
  time,
  prodLines,
  Collection,
  matchesEquals,
  matchesProdLine,
  limitOrgUnits,
  ProdShiftOrder
) {
  'use strict';

  return Collection.extend({

    model: ProdShiftOrder,

    rqlQuery: function(rql)
    {
      var selector = [
        {name: 'ge', args: ['startedAt', time.getMoment().subtract(1, 'months').valueOf()]}
      ];

      limitOrgUnits(selector, {
        divisionType: 'prod'
      });

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
          args: selector
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
        && matchesEquals(this.rqlQuery, 'orderMrp', message.orderMrp)
        && matchesEquals(this.rqlQuery, 'shift', message.shift);
    }

  });
});
