// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  '../core/Collection',
  './HourlyPlan'
], function(
  user,
  Collection,
  HourlyPlan
) {
  'use strict';

  return Collection.extend({

    model: HourlyPlan,

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
        fields: {division: 1, date: 1, shift: 1, createdAt: 1, creator: 1},
        sort: {date: -1},
        limit: -1,
        selector: selector
      });
    }

  });
});
