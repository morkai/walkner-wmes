// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Collection',
  './HeffLineState'
], function(
  user,
  Collection,
  HeffLineState
) {
  'use strict';

  return Collection.extend({

    model: HeffLineState,

    rqlQuery: function(rql)
    {
      var selector;
      var userDivision = user.getDivision();

      if (userDivision && userDivision.get('type') === 'prod')
      {
        selector = {
          name: 'and',
          args: [{name: 'eq', args: ['division', userDivision.id]}]
        };
      }

      return rql.Query.fromObject({
        sort: {date: -1},
        limit: 1000,
        selector: selector
      });
    }

  });
});
