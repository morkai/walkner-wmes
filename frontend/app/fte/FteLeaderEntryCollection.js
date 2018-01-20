// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  '../core/Collection',
  './FteLeaderEntry',
  './FteWhEntry'
], function(
  user,
  Collection,
  FteLeaderEntry,
  FteWhEntry
) {
  'use strict';

  return Collection.extend({

    TYPE: 'leader',

    model: FteLeaderEntry,

    rqlQuery: function(rql)
    {
      var selector;
      var userDivision = user.getDivision();

      if (userDivision && userDivision.get('type') !== 'prod' && userDivision.id !== FteWhEntry.WH_DIVISION)
      {
        selector = {
          name: 'and',
          args: [{name: 'eq', args: [user.data.orgUnitType, user.data.orgUnitId]}]
        };
      }

      return rql.Query.fromObject({
        fields: {
          subdivision: 1,
          date: 1,
          shift: 1,
          createdAt: 1,
          creator: 1,
          'tasks.functions.id': 1
        },
        sort: {date: -1},
        limit: 20,
        selector: selector
      });
    }

  });
});
