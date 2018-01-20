// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  './FteLeaderEntryCollection',
  './FteWhEntry'
], function(
  user,
  FteLeaderEntryCollection,
  FteWhEntry
) {
  'use strict';

  return FteLeaderEntryCollection.extend({

    TYPE: 'wh',

    model: FteWhEntry,

    rqlQuery: function(rql)
    {
      var selector;
      var userDivision = user.getDivision();

      if (userDivision && userDivision.id === FteWhEntry.WH_DIVISION)
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
