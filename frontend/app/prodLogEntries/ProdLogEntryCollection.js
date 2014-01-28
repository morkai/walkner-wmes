define([
  'underscore',
  '../user',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesOperType',
  '../core/util/matchesProdLine',
  './ProdLogEntry'
], function(
  _,
  user,
  prodLines,
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
        fields: {

        },
        sort: {
          createdAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: []
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
