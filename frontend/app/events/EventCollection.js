// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'moment',
  '../core/Collection',
  './Event'
], function(
  moment,
  Collection,
  Event
) {
  'use strict';

  return Collection.extend({

    model: Event,

    rqlQuery: function(rql)
    {
      var sevenDaysAgo = moment()
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .subtract('days', 7)
        .valueOf();

      return rql.Query.fromObject({
        fields: {type: 1, severity: 1, user: 1, time: 1, data: 1},
        sort: {time: -1},
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['time', sevenDaysAgo]}
          ]
        }
      });
    }

  });
});
