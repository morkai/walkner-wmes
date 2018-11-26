// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './QiResult'
], function(
  time,
  Collection,
  QiResult
) {
  'use strict';

  return Collection.extend({

    model: QiResult,

    theadHeight: 2,

    rowHeight: 2,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {
          inspectedAt: -1,
          rid: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['inspectedAt', time.getMoment().startOf('day').subtract(14, 'days').valueOf()]}
          ]
        }
      });
    },

    hasAnyNokResult: function()
    {
      return this.some(function(result) { return !result.get('ok'); });
    }

  });
});
