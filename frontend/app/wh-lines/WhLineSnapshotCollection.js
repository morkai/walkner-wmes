// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Collection',
  'app/core/util/getShiftStartInfo',
  './WhLineSnapshot'
], function(
  Collection,
  getShiftStartInfo,
  WhLineSnapshot
) {
  'use strict';

  return Collection.extend({

    model: WhLineSnapshot,

    rqlQuery: function(rql)
    {
      var moment = getShiftStartInfo(Date.now()).moment;

      if (moment.day() === 0 && moment.hours() === 6)
      {
        moment.subtract(3, 'days').hours(22);
      }
      else
      {
        moment.subtract(8, 'hours');
      }

      return rql.Query.fromObject({
        sort: {time: 1},
        limit: -1337,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['time', moment.valueOf()]},
            {name: 'lt', args: ['time', moment.add(8, 'hours').valueOf()]}
          ]
        }
      });
    }

  });
});
