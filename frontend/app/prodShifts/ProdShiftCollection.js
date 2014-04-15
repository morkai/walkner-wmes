// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../user',
  '../data/prodLines',
  '../core/Collection',
  '../core/util/matchesProdLine',
  './ProdShift'
], function(
  _,
  user,
  prodLines,
  Collection,
  matchesProdLine,
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
          args: []
        }
      });
    },

    matches: function(message)
    {
      return message.types.indexOf('changeShift') !== -1
        && matchesProdLine(this.rqlQuery, message.prodLine);
    }

  });
});
