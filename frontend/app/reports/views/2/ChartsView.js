// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './ClipChartView',
  'app/reports/templates/2/charts'
], function(
  View,
  ClipChartView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.setView(
        '.reports-2-clip-container',
        new ClipChartView({
          model: this.model,
          settings: this.settings,
          displayOptions: this.displayOptions,
          skipRenderChart: this.options.skipRenderCharts
        })
      );
    },

    afterRender: function()
    {
      if (!this.options.skipRenderCharts)
      {
        this.promised(this.model.fetch());
      }

      var orgUnitType = this.model.get('orgUnitType');

      this.$el.attr('data-orgUnitType', orgUnitType);
      this.$el.attr('data-orgUnitId', orgUnitType ? this.model.get('orgUnit').id : undefined);
    },

    renderCharts: function(load)
    {
      this.getViews().forEach(function(view)
      {
        view.render();
      });

      if (load)
      {
        this.promised(this.model.fetch());
      }
    },

    reflowCharts: function()
    {
      this.getViews().forEach(function(view)
      {
        if (view.chart)
        {
          view.chart.reflow();
        }
      });
    }

  });
});
