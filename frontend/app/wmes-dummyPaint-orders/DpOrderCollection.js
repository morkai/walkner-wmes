// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './DpOrder'
], function(
  Collection,
  getShiftStartInfo,
  DpOrder
) {
  'use strict';

  return Collection.extend({

    model: DpOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        limit: -1337,
        sort: {
          createdAt: -1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['createdAt', getShiftStartInfo(Date.now()).moment.hours(6).valueOf()]},
            {name: 'eq', args: ['changed', false]}
          ]
        }
      });
    }

  });
});
