// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  '../core/Collection',
  './FteLeaderEntry'
], function(
  time,
  user,
  Collection,
  FteLeaderEntry
) {
  'use strict';

  return Collection.extend({

    TYPE: 'leader',

    model: FteLeaderEntry,

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

      if (userDivision && userDivision.get('type') === 'other')
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
