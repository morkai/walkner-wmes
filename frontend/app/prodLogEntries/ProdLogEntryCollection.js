// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  '../core/util/matchesOperType',
  '../core/util/matchesProdLine',
  './ProdLogEntry'
], function(
  time,
  Collection,
  matchesOperType,
  matchesProdLine,
  ProdLogEntry
) {
  'use strict';

  return Collection.extend({

    model: ProdLogEntry,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        sort: {
          createdAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['createdAt', time.getMoment().startOf('day').subtract(1, 'week')]}
          ]
        }
      });
    },

    matches: function(message)
    {
      return matchesOperType(this.rqlQuery, message.types)
        && matchesProdLine(this.rqlQuery, message.prodLine);
    }

  });
});
