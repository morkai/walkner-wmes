define([
  'screenfull',
  'app/i18n',
  'app/core/View',
  './Report1CoeffsChartView',
  './Report1DowntimesChartView',
  'app/reports/templates/report1Charts'
], function(
  screenfull,
  t,
  View,
  Report1CoeffsChartView,
  Report1DowntimesChartView,
  report1ChartsTemplate
) {
  'use strict';

  return View.extend({

    template: report1ChartsTemplate,

    events: {
      'click .highcharts-title': function(e)
      {
        if (!e.ctrlKey || !screenfull.enabled)
        {
          return;
        }

        if (screenfull.isFullscreen)
        {
          screenfull.exit();

          return;
        }

        screenfull.request(this.$(e.target).closest('.reports-chart')[0]);
      }
    },

    initialize: function()
    {
      this.setView(
        '.reports-1-coeffs-container',
        new Report1CoeffsChartView({
          model: this.model,
          metricRefs: this.metricRefs,
          skipRenderChart: this.options.skipRenderCharts
        })
      );

      this.setView(
        '.reports-1-downtimesByAor-container',
        new Report1DowntimesChartView({
          model: this.model,
          attrName: 'downtimesByAor',
          skipRenderChart: this.options.skipRenderCharts
        })
      );

      this.setView(
        '.reports-1-downtimesByReason-container',
        new Report1DowntimesChartView({
          model: this.model,
          attrName: 'downtimesByReason',
          skipRenderChart: this.options.skipRenderCharts
        })
      );
    },

    afterRender: function()
    {
      if (this.options.renderCharts !== false)
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
