// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../socket',
  '../core/Collection',
  '../data/orgUnits',
  './DailyMrpPlanLine'
], function(
  _,
  $,
  socket,
  Collection,
  orgUnits,
  DailyMrpPlanLine
) {
  'use strict';

  return Collection.extend({

    model: DailyMrpPlanLine,

    initialize: function(attrs, options)
    {
      this.plan = options.plan;
    },

    update: function(newLines)
    {
      var lines = this;

      if (_.isEqual(lines.pluck('_id'), newLines))
      {
        return;
      }

      newLines = newLines.map(function(lineId)
      {
        var line = lines.get(lineId);

        if (!line)
        {
          var prodLine = orgUnits.getByTypeAndId('prodLine', lineId);

          line = new DailyMrpPlanLine({
            _id: prodLine.id,
            name: prodLine.get('description')
          });
        }

        return line;
      });

      this.reset(newLines);

      return lines.plan.saveLines();
    }

  });
});
