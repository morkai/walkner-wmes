// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  '../core/Collection',
  './FteMasterEntry'
], function(
  user,
  Collection,
  FteMasterEntry
) {
  'use strict';

  return Collection.extend({

    model: FteMasterEntry,

    rqlQuery: function(rql)
    {
      var selector;
      var userDivision = user.getDivision();

      if (userDivision && userDivision.get('type') === 'prod')
      {
        selector = {
          name: 'and',
          args: [{name: 'eq', args: [user.data.orgUnitType, user.data.orgUnitId]}]
        };
      }

      return rql.Query.fromObject({
        fields: {subdivision: 1, date: 1, shift: 1, createdAt: 1, creator: 1},
        sort: {date: -1},
        limit: 20,
        selector: selector
      });
    }

  });
});
