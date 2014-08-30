// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesEquals',
  '../core/util/matchesProdLine',
  './ProdShiftOrder'
], function(
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
          losses: 0
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

    comparator: 'startedAt',

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
