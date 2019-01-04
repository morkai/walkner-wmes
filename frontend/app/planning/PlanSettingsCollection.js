// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../core/Collection',
  './PlanSettings'
], function(
  time,
  Collection,
  PlanSettings
) {
  'use strict';

  return Collection.extend({

    model: PlanSettings,

    rqlQuery: function(rql)
    {
      var today = time.utc.getMoment().startOf('day');
      var from = today.clone().subtract(3, 'days').valueOf();
      var to = today.clone().add(3, 'days').valueOf();

      return rql.Query.fromObject({
        fields: {
          'mrps._id': 1,
          'mrps.lines._id': 1
        },
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['_id', from]},
            {name: 'le', args: ['_id', to]}
          ]
        }
      });
    }

  });
});
