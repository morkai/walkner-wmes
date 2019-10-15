// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../user',
  '../core/Collection',
  '../core/util/matchesDate',
  '../core/util/matchesOperType',
  '../core/util/matchesEquals',
  '../orgUnits/util/limitOrgUnits',
  './ProdLogEntry'
], function(
  time,
  user,
  Collection,
  matchesDate,
  matchesOperType,
  matchesEquals,
  limitOrgUnits,
  ProdLogEntry
) {
  'use strict';

  return Collection.extend({

    model: ProdLogEntry,

    rowHeight: false,

    rqlQuery: function(rql)
    {
      var selector = [
        {name: 'ge', args: ['createdAt', time.getMoment().startOf('day').subtract(1, 'week').valueOf()]}
      ];

      limitOrgUnits(selector, {
        divisionType: 'prod',
        subdivisionType: 'assembly'
      });

      return rql.Query.fromObject({
        sort: {
          createdAt: -1
        },
        limit: -1337,
        selector: {
          name: 'and',
          args: selector
        }
      });
    },

    matches: function(message)
    {
      var rql = this.rqlQuery;

      return matchesDate(rql, 'createdAt', message.createdAt)
        && matchesOperType(rql, message.types)
        && matchesEquals(rql, 'prodLine', message.prodLine);
    }

  });
});
