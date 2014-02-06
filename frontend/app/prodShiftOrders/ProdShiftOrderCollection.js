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
          mrpControllers: 1,
          prodFlow: 1,
          prodLine: 1,
          prodShift: 1,
          orderId: 1,
          operationNo: 1,
          quantityDone: 1,
          workerCount: 1,
          orderData: 1,
          startedAt: 1,
          finishedAt: 1
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
