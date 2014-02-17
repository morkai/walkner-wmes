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

      if (user.data.orgUnitType && user.data.orgUnitType !== 'unspecified')
      {
        selector = {
          name: 'and',
          args: [{name: 'eq', args: [user.data.orgUnitType, user.data.orgUnitId]}]
        };
      }

      return rql.Query.fromObject({
        fields: {subdivision: 1, date: 1, shift: 1, locked: 1},
        sort: {date: -1},
        limit: 15,
        selector: selector
      });
    }

  });
});
