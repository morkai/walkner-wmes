// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../user',
  '../core/Collection',
  './ProdChangeRequest'
], function(
  _,
  user,
  Collection,
  ProdChangeRequest
) {
  'use strict';

  return Collection.extend({

    model: ProdChangeRequest,

    rqlQuery: function(rql)
    {
      var selector = [
        {name: 'eq', args: ['status', 'new']}
      ];

      var userDivision = user.getDivision();

      if (userDivision)
      {
        selector.push({name: 'eq', args: ['division', userDivision.id]});
      }

      return rql.Query.fromObject({
        limit: 20,
        sort: {
          prodLine: 1,
          _id: 1
        },
        selector: {
          name: 'and',
          args: selector
        }
      });
    },

    isNewStatus: function()
    {
      return _.some(this.rqlQuery.selector.args, function(term)
      {
        return term.args[0] === 'status' && term.args[1] === 'new';
      });
    }

  });
});
