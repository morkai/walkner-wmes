// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Collection',
  '../core/util/matchesOperType',
  '../core/util/matchesProdLine',
  './ProdLogEntry'
], function(
  time,
  Collection,
  matchesOperType,
  matchesProdLine,
  ProdLogEntry
) {
  'use strict';

  return Collection.extend({

    model: ProdLogEntry,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        sort: {
          createdAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['createdAt', time.getMoment().startOf('day').subtract(1, 'week')]}
          ]
        }
      });
    },

    matches: function(message)
    {
      return matchesOperType(this.rqlQuery, message.types)
        && matchesProdLine(this.rqlQuery, message.prodLine);
    }

  });
});
