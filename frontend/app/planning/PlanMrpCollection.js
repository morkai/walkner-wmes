// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/Collection',
  'app/data/orgUnits',
  './PlanMrp'
], function(
  _,
  Collection,
  orgUnits,
  PlanMrp
) {
  'use strict';

  return Collection.extend({

    model: PlanMrp,

    initialize: function(models, options)
    {
      this.plan = options.plan;
    },

    cache: function()
    {
      var plan = this.plan;
      var planMrps = [];

      plan.settings.get('mrps').forEach(function(mrpSettings)
      {
        var mrp = orgUnits.getByTypeAndId('mrpController', mrpSettings._id);
        var planMrp = {
          _id: mrpSettings._id,
          description: mrp ? mrp.get('description') : '',
          lines: mrpSettings.lines.map(function(mrpLineSettings)
          {
            var line = orgUnits.getByTypeAndId('prodLine', mrpLineSettings._id);
            var lineSettings = _.find(plan.settings.get('lines'), {_id: mrpLineSettings._id});

            return {
              _id: mrpLineSettings._id,
              description: line ? line.get('description') : '',
              workerCount: mrpLineSettings.workerCount,
              activeFrom: lineSettings.activeFrom,
              activeTo: lineSettings.activeTo
            };
          })
        };

        planMrps.push(new PlanMrp(planMrp, {plan: plan}));
      });

      this.reset(planMrps);
    }

  });
});
