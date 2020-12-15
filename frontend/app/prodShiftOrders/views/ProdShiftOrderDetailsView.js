// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/views/DetailsView',
  'app/prodShiftOrders/templates/details'
], function(
  time,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    serializeDetails: function()
    {
      return this.model.serializeDetails({
        prodDowntimes: this.prodDowntimes
      });
    },

    afterRender: function()
    {
      DetailsView.prototype.afterRender.apply(this, arguments);

      if (!this.model.get('finishedAt'))
      {
        clearInterval(this.timers.updateEfficiency);
        this.timers.updateEfficiency = setInterval(this.updateEfficiency.bind(this), 5000);
      }
    },

    updateEfficiency: function()
    {
      var eff = this.model.getEfficiency({
        prodDowntimes: this.prodDowntimes
      });

      if (eff)
      {
        this.$('.prop[data-prop="efficiency"] > .prop-value').text(Math.round(eff * 100) + '%');
      }

      var startedAt = Date.parse(this.model.get('startedAt'));
      var finishedAt = Date.now();
      var duration = time.toString((finishedAt - startedAt) / 1000, false);

      this.$('.prop[data-prop="duration"] > .prop-value').text(duration);
    }

  });
});
