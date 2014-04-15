// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

      if (userDivision)
      {
        selector = {
          name: 'and',
          args: [{name: 'eq', args: ['division', userDivision.id]}]
        };
      }

      return rql.Query.fromObject({
        fields: {division: 1, date: 1, shift: 1, createdAt: 1, creator: 1},
        sort: {date: -1},
        limit: 15,
        selector: selector
      });
    }

  });
});
