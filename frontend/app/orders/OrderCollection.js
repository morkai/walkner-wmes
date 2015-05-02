// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../core/Collection',
  './Order'
], function(
  Collection,
  Order
) {
  'use strict';

  return Collection.extend({

    model: Order,

    rqlQuery: function(rql)
    {
      var today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);

      return rql.Query.fromObject({
        fields: {
          nc12: 1,
          name: 1,
          mrp: 1,
          qty: 1,
          unit: 1,
          startDate: 1,
          finishDate: 1,
          statuses: 1,
          delayReason: 1
        },
        limit: 15,
        sort: {
          finishDate: 1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['finishDate', today.getTime()]}
          ]
        }
      });
    }

  });
});
