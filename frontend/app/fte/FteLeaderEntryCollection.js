define([
  'app/user',
  '../core/Collection',
  './FteLeaderEntry'
], function(
  user,
  Collection,
  FteLeaderEntry
) {
  'use strict';

  return Collection.extend({

    model: FteLeaderEntry,

    rqlQuery: function(rql)
    {
      var selector;

      if (user.data.aor)
      {
        selector = {
          name: 'and',
          args: [
            {name: 'eq', args: ['aor', user.data.aor]}
          ]
        };
      }

      return rql.Query.fromObject({
        fields: {aor: 1, date: 1, shift: 1},
        sort: {date: -1, shift: -1},
        limit: 15,
        selector: selector
      });
    }

  });
});
