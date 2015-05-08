// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Collection',
  './XiconfOrder'
], function(
  time,
  Collection,
  XiconfOrder
) {
  'use strict';

  return Collection.extend({

    model: XiconfOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {
          items: 0
        },
        sort: {
          reqDate: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'lt', args: ['reqDate', time.getMoment().startOf('day').add(1, 'days').valueOf()]},
            {name: 'in', args: ['status', [0, 1]]}
          ]
        }
      });
    }

  });
});
