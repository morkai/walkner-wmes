// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesProdLine',
  '../core/util/matchesEquals',
  '../orgUnits/util/limitOrgUnits',
  './ProdShift'
], function(
  time,
  prodLines,
  Collection,
  matchesProdLine,
  matchesEquals,
  limitOrgUnits,
  ProdShift
) {
  'use strict';

  return Collection.extend({

    model: ProdShift,

    rqlQuery: function(rql)
    {
      var selector = [
        {name: 'ge', args: ['date', time.getMoment().subtract(1, 'week').startOf('day').valueOf()]}
      ];

      limitOrgUnits(selector, {
        divisionType: 'prod',
        subdivisionType: 'assembly'
      });

      return rql.Query.fromObject({
        fields: {},
        sort: {
          date: -1
        },
        limit: -1337,
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
        && matchesEquals(this.rqlQuery, 'shift', message.shift);
    }

  });
});
