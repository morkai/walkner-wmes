// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Collection',
  './PurchaseOrder'
], function(
  time,
  Collection,
  PurchaseOrder
) {
  'use strict';

  return Collection.extend({

    model: PurchaseOrder,

    rqlQuery: function(rql)
    {
      var tomorrow = time.getMoment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).add('day', 1).valueOf();

      return rql.Query.fromObject({
        fields: {
          changes: 0,
          'items.prints': 0
        },
        limit: 20,
        sort: {
          'scheduledAt': 1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'eq', args: ['open', true]},
            {name: 'lt', args: ['scheduledAt', tomorrow]},
            {name: 'populate', args: ['vendor']}
          ]
        }
      });
    }

  });
});
