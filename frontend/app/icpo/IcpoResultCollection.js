// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './IcpoResult'
], function(
  _,
  time,
  Collection,
  IcpoResult
) {
  'use strict';

  return Collection.extend({

    model: IcpoResult,

    rqlQuery: function(rql)
    {
      var weekAgo = time.getMoment()
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .subtract(7, 'days').valueOf();

      return rql.Query.fromObject({
        fields: {
          serviceTag: 1,
          driver: 1,
          gprs: 1,
          led: 1,
          startedAt: 1,
          finishedAt: 1,
          duration: 1,
          result: 1,
          srcId: 1
        },
        sort: {
          startedAt: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [{name: 'ge', args: ['startedAt', weekAgo]}]
        }
      });
    },

    initialize: function()
    {
      this.srcIds = null;
    },

    parse: function(res)
    {
      if (Array.isArray(res.srcIds))
      {
        var first = this.srcIds === null;
        var diff = !_.isEqual(res.srcIds, this.srcIds);

        this.srcIds = res.srcIds;

        if (!first && diff)
        {
          this.trigger('change:srcIds');
        }
      }

      return Collection.prototype.parse.call(this, res);
    }

  });
});
