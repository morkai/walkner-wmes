// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Collection',
  './EmptyOrder'
], function(
  time,
  Collection,
  EmptyOrder
) {
  'use strict';

  return Collection.extend({

    model: EmptyOrder,

    rqlQuery: function(rql)
    {
      var today = time.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);

      return rql.Query.fromObject({
        fields: {nc12: 1, mrp: 1, startDate: 1, finishDate: 1},
        sort: {startDate: -1, finishDate: -1},
        limit: 15,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['startDate', today.valueOf()]},
            {name: 'le', args: ['startDate', today.valueOf()]}
          ]
        }
      });
    }

  });
});
