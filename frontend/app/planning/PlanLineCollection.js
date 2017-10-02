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
    }

  });
});
