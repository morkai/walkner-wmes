// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Collection',
  './Pce'
], function(
  time,
  Collection,
  Pce
) {
  'use strict';

  return Collection.extend({

    model: Pce,

    rqlQuery: function(rql)
    {
      var selector = [
        {
          name: 'ge',
          args: [
            'startedAt',
            time.getMoment().startOf('day').subtract(2, 'weeks').valueOf()
          ]
        }
      ];

      return rql.Query.fromObject({
        sort: {
          startedAt: -1
        },
        limit: -1337,
        selector: {
          name: 'and',
          args: selector
        }
      });
    }

  });
});
