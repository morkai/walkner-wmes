// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Collection',
  './WhEvent'
], function(
  time,
  Collection,
  WhEvent
) {
  'use strict';

  return Collection.extend({

    model: WhEvent,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        sort: {
          time: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [{
            name: 'ge',
            args: ['time', time.getMoment().startOf('day').subtract(7, 'days').hours(6).valueOf()]
          }]
        }
      });
    }

  });
});
