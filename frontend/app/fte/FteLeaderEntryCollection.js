// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
      var userDivision = user.getDivision();

      if (userDivision && userDivision.get('type') !== 'prod')
      {
        selector = {
          name: 'and',
          args: [{name: 'eq', args: [user.data.orgUnitType, user.data.orgUnitId]}]
        };
      }

      return rql.Query.fromObject({
        fields: {subdivision: 1, date: 1, shift: 1, createdAt: 1, creator: 1},
        sort: {date: -1},
        limit: 15,
        selector: selector
      });
    }

  });
});
