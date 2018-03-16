// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './PlanMrp'
], function(
  Collection,
  PlanMrp
) {
  'use strict';

  return Collection.extend({

    model: PlanMrp,

    initialize: function(models, options)
    {
      this.plan = options && options.plan;
    },

    reset: function(models, options)
    {
      if (!models)
      {
        models = this.createModelsFromSettings();
      }

      return Collection.prototype.reset.call(this, models, options);
    },

    createModelsFromSettings: function()
    {
      var plan = this.plan;
      var mrpIds = plan.displayOptions.get('mrps');
      var exclude = plan.displayOptions.get('exclude');

      var ordersByMrp = plan.orders.getGroupedByMrp();
      var linesByMrp = plan.lines.getGroupedByMrp();

      return plan.settings.getDefinedMrpIds()
        .filter(function(mrpId)
        {
          if (mrpIds.length === 0)
          {
            return true;
          }

          if (exclude)
          {
            return mrpIds.indexOf(mrpId) === -1;
          }

          return mrpIds.indexOf(mrpId) !== -1;
        })
        .map(function(mrpId)
        {
          return new PlanMrp({
            _id: mrpId,
            orders: ordersByMrp[mrpId] || [],
            lines: linesByMrp[mrpId] || []
          });
        });
    }

  });
});
