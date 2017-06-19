// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  './CoeffsChartView',
  './DowntimesChartView',
  'app/reports/templates/1/charts'
], function(
  View,
  CoeffsChartView,
  DowntimesChartView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      var skipRenderCharts = this.options.skipRenderCharts;

      this.setView(
        '.reports-1-coeffs-container',
        new CoeffsChartView({
          model: this.model,
          settings: this.settings,
          displayOptions: this.displayOptions,
          skipRenderChart: skipRenderCharts
        })
      );

      this.setView(
        '.reports-1-downtimesByAor-container',
        new DowntimesChartView({
          model: this.model,
          attrName: 'downtimesByAor',
          displayOptions: this.displayOptions,
          skipRenderChart: skipRenderCharts
        })
      );

      this.setView(
        '.reports-1-downtimesByReason-container',
        new DowntimesChartView({
          model: this.model,
          attrName: 'downtimesByReason',
          displayOptions: this.displayOptions,
          skipRenderChart: skipRenderCharts
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
