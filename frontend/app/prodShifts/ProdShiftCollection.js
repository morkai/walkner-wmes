// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesProdLine',
  '../core/util/matchesEquals',
  './ProdShift'
], function(
  time,
  prodLines,
  Collection,
  matchesProdLine,
  matchesEquals,
  ProdShift
) {
  'use strict';

  return Collection.extend({

    model: ProdShift,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {
          date: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['date', time.getMoment().subtract(1, 'months').startOf('day').valueOf()]}
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
        && matchesEquals(this.rqlQuery, 'shift', message.shift);
    }

  });
});
