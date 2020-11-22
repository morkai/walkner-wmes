// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanWorkingLine'
], function(
  Collection,
  PlanWorkingLine
) {
  'use strict';

  return Collection.extend({

    model: PlanWorkingLine,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    url: function()
    {
      return '/planning/workingLines/' + this.plan.id;
    },

    getNextStartTime: function(planLine)
    {
      var shiftData = planLine.get('shiftData');
      var workingLine = this.get(planLine.id);

      return shiftData.map(function(data, shiftNo)
      {
        if (shiftNo === 0)
        {
          return 0;
        }

        for (var s = shiftNo + 1; s <= 3; ++s)
        {
          if (shiftData[s].startAt)
          {
            return Date.parse(shiftData[s].startAt);
          }
        }

        return workingLine ? workingLine.get('startAt') : 0;
      });
    }

  });
});
