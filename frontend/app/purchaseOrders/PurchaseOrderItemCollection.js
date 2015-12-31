// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PurchaseOrderItem'
], function(
  Collection,
  PurchaseOrderItem
) {
  'use strict';

  return Collection.extend({

    model: PurchaseOrderItem,

    comparator: '_id',

    getMinScheduleDate: function()
    {
      var today = new Date();
      today.setUTCHours(0);
      today.setUTCMinutes(0);
      today.setUTCSeconds(0);
      today.setUTCMilliseconds(0);
      today = today.getTime();

      var minScheduleTime = Infinity;

      for (var i = 0, l = this.length; i < l; ++i)
      {
        var item = this.models[i];

        if (item.get('completed'))
        {
          continue;
        }

        var schedule = item.get('schedule');

        for (var ii = 0, ll = schedule.length; ii < ll; ++ii)
        {
          var itemScheduleTime = Date.parse(schedule[ii].date);

          if (itemScheduleTime < minScheduleTime)
          {
            minScheduleTime = itemScheduleTime;
          }
        }
      }

      return minScheduleTime === Infinity ? null : new Date(minScheduleTime);
    }

  });
});
