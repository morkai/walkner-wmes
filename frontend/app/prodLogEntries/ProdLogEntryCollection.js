// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../user',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesOperType',
  '../core/util/matchesProdLine',
  './ProdLogEntry'
], function(
  _,
  user,
  prodLines,
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
        fields: {

        },
        sort: {
          createdAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: []
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
