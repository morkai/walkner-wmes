// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './Test'
], function(
  time,
  Collection,
  Test
) {
  'use strict';

  return Collection.extend({

    model: Test,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          startedAt: 1,
          finishedAt: 1,
          'program.name': 1,
          result: 1,
          orderNo: 1,
          serialNo: 1,
          prodLine: 1
        },
        sort: {
          startedAt: -1
        },
        limit: -1337,
        selector: {
          name: 'and',
          args: [{
            name: 'ge',
            args: ['startedAt', time.getMoment().startOf('week').subtract(2, 'weeks')]
          }]
        }
      });
    }

  });
});
