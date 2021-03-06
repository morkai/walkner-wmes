// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../user',
  '../core/Collection',
  '../orgUnits/util/limitOrgUnits',
  './ProdChangeRequest'
], function(
  _,
  user,
  Collection,
  limitOrgUnits,
  ProdChangeRequest
) {
  'use strict';

  return Collection.extend({

    model: ProdChangeRequest,

    rowHeight: false,

    rqlQuery: function(rql)
    {
      var selector = [
        {name: 'eq', args: ['status', 'new']}
      ];

      limitOrgUnits(selector, {
        subdivision: false,
        divisionType: 'prod'
      });

      return rql.Query.fromObject({
        limit: -1337,
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
