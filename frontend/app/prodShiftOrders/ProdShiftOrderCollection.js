define([
  'underscore',
  '../user',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesEquals',
  '../core/util/matchesProdLine',
  './ProdShiftOrder'
], function(
  _,
  user,
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
          mechOrder: 0
        },
        sort: {
          startedAt: -1
        },
        limit: 15,
        selector: {
          name: 'and',
          args: []
        }
      });
    },

    matches: function(message)
    {
      return matchesProdLine(this.rqlQuery, message.prodLine)
        && matchesEquals(this.rqlQuery, 'orderId', message.orderId)
        && matchesEquals(this.rqlQuery, 'operationNo', message.operationNo)
        && matchesEquals(this.rqlQuery, 'shift', message.shift);
    }

  });
});
