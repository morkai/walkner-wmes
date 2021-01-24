// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanLine'
], function(
  Collection,
  PlanLine
) {
  'use strict';

  return Collection.extend({

    model: PlanLine,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    getGroupedByMrp: function()
    {
      var plan = this.plan;
      var mrpToLines = {};

      this.forEach(function(line)
      {
        var lineSettings = plan.settings.lines.get(line.id);

        if (!lineSettings)
        {
          return;
        }

        lineSettings.get('mrpPriority').forEach(function(mrpId)
        {
          if (!mrpToLines[mrpId])
          {
            mrpToLines[mrpId] = [];
          }

          mrpToLines[mrpId].push(line);
        });
      });

      return mrpToLines;
    },

    getSortedByPriority: function(linePriority)
    {
      return Array.prototype.slice.call(this.models).sort((a, b) =>
      {
        var aPriority = linePriority.indexOf(a.id);
        var bPriority = linePriority.indexOf(b.id);

        if (aPriority === -1)
        {
          aPriority = Number.MAX_SAFE_INTEGER;
        }

        if (bPriority === -1)
        {
          bPriority = Number.MAX_SAFE_INTEGER;
        }

        return aPriority - bPriority;
      });
    }

  });
});
