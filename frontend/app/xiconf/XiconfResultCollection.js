// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../time',
  '../core/Collection',
  './XiconfResult'
], function(
  _,
  time,
  Collection,
  XiconfResult
) {
  'use strict';

  return Collection.extend({

    model: XiconfResult,

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
          log: 0,
          metrics: 0,
          leds: 0
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
