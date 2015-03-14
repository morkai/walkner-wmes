// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../core/Collection',
  './XiconfProgramOrder'
], function(
  time,
  Collection,
  XiconfProgramOrder
) {
  'use strict';

  return Collection.extend({

    model: XiconfProgramOrder,

    rqlQuery: function(rql)
    {
      return rql.Query.fromObject({
        fields: {},
        sort: {
          reqDate: -1
        },
        limit: 20,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['reqDate', time.getMoment().startOf('day').subtract(7, 'days').valueOf()]},
            {name: 'lt', args: ['reqDate', time.getMoment().startOf('day').add(1, 'days').valueOf()]}
          ]
        }
      });
    }

  });
});
