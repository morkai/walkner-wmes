// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './WhDowntime'
], function(
  Collection,
  getShiftStartInfo,
  WhDowntime
) {
  'use strict';

  return Collection.extend({

    model: WhDowntime,

    rqlQuery: function(rql)
    {
      var date = getShiftStartInfo(Date.now()).moment.hours(6).subtract(7, 'days').valueOf();

      return rql.Query.fromObject({
        sort: {
          startedAt: -1
        },
        limit: -1337,
        selector: {
          name: 'and',
          args: [{name: 'ge', args: ['startedAt', date]}]
        }
      });
    }

  });
});
