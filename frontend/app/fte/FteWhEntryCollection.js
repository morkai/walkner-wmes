// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  './FteLeaderEntryCollection',
  './FteWhEntry'
], function(
  time,
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
      var userDivision = user.getDivision();
      var selector = {
        name: 'and',
        args: [{
          name: 'ge',
          args: ['date', time.getMoment().subtract(7, 'days').valueOf()]
        }]
      };

      if (userDivision && userDivision.get('type') === 'wh')
      {
        selector.args.push({
          name: 'eq',
          args: [user.data.orgUnitType, user.data.orgUnitId]
        });
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
        limit: -1337,
        selector: selector
      });
    }

  });
});
