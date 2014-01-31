define([
  'underscore',
  '../user',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesProdLine',
  './ProdShift'
], function(
  _,
  user,
  prodLines,
  Collection,
  matchesProdLine,
  ProdShift
) {
  'use strict';

  return Collection.extend({

    model: ProdShift,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          mrpControllers: 1,
          prodFlow: 1,
          prodLine: 1,
          date: 1,
          shift: 1,
          createdAt: 1,
          creator: 1
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
      return message.types.indexOf('changeShift') !== -1
        && matchesProdLine(this.rqlQuery, message.prodLine);
    }

  });
});
