// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesProdLine',
  '../core/util/matchesEquals',
  './ProdShift'
], function(
  time,
  prodLines,
  Collection,
  matchesProdLine,
  matchesEquals,
  ProdShift
) {
  'use strict';

  return Collection.extend({

    model: ProdShift,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          mrpControllers: 1,
          prodFlow: 1,
          prodLine: 1,
          date: 1,
          shift: 1,
          createdAt: 1,
          creator: 1
        },
        sort: {
          createdAt: -1
        },
        limit: 15,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['date', time.getMoment().subtract(1, 'months').startOf('day').valueOf()]}
          ]
        }
      });
    },

    hasOrMatches: function(message)
    {
      if (this.get(message._id))
      {
        return true;
      }

      return matchesProdLine(this.rqlQuery, message.prodLine) && matchesEquals(this.rqlQuery, 'shift', message.shift);
    }

  });
});
